"""Upload visually reviewed, hash-checked native captures to the six prepared IAPs."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

spec = importlib.util.spec_from_file_location('apple_helper', Path(__file__).with_name('inspect-apple-products.py'))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
PRODUCTS = {'daisy': '6833273777', 'mick': '6833273722', 'cyberpunk': '6833273815',
            'goldonly': '6833273980', 'synthwave': '6833274009', 'ragepass': '6833274120'}


def main():
    root = Path(os.environ.get('REVIEW_CAPTURE_ROOT', 'work/review-captures')).resolve()
    manifests = list(root.rglob('manifest.json'))
    if len(manifests) != 1:
        raise SystemExit('Expected the exact iPhone capture artifact with one manifest.')
    manifest = manifests[0]
    rows = json.loads(manifest.read_text())

    def select(prefix, expected_hash):
        candidates = []
        for test in rows:
            for item in test.get('attachments', []):
                if item.get('suggestedHumanReadableName', '').startswith(prefix):
                    path = (manifest.parent / item['exportedFileName']).resolve()
                    if not path.is_relative_to(root) or path.suffix != '.png':
                        raise ValueError('Unexpected screenshot path')
                    candidates.append(path)
        if len(candidates) != 1:
            raise ValueError('A unique genuine native capture is required: ' + prefix)
        data = candidates[0].read_bytes()
        if not expected_hash or hashlib.sha256(data).hexdigest() != expected_hash:
            raise ValueError('Screenshot differs from the visually reviewed file: ' + prefix)
        if not data.startswith(b'\x89PNG\r\n\x1a\n'):
            raise ValueError('Expected a genuine PNG capture')
        return data

    voices = select('10-native-voice-products', os.environ.get('REVIEW_VOICE_SHA256'))
    palettes = select('11-native-palette-products', os.environ.get('REVIEW_PALETTE_SHA256'))
    auth = helper.token()
    opener = urllib.request.build_opener(helper.NoRedirect)

    def api(path, data=None, method=None, allow_missing=False):
        req = urllib.request.Request('https://api.appstoreconnect.apple.com' + path,
            data=json.dumps(data).encode() if data is not None else None, method=method,
            headers={'Authorization': 'Bearer ' + auth, 'Content-Type': 'application/json'})
        try:
            with opener.open(req, timeout=45) as response:
                body = response.read()
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as error:
            if allow_missing and error.code == 404:
                return None
            print(json.dumps({'endpoint': path, 'status': error.code}))
            raise SystemExit('Screenshot upload stopped; no review submission performed.')

    for alias, identifier in PRODUCTS.items():
        product = api('/v2/inAppPurchases/' + identifier)['data']
        if product['attributes']['productId'] != 'com.pettygamesstudios.ninetynineimpossible.' + alias:
            raise ValueError('Existing Apple product identity mismatch')
        existing = api('/v2/inAppPurchases/' + identifier + '/appStoreReviewScreenshot', allow_missing=True)
        existing = existing.get('data') if existing else None
        if existing:
            state = existing['attributes'].get('assetDeliveryState', {}).get('state')
            if state == 'COMPLETE':
                print(json.dumps({'product': alias, 'screenshot': 'existing complete image preserved'}), flush=True)
                continue
            if existing['attributes'].get('fileName') != 'n99-' + alias + '-native-review.png':
                raise SystemExit('An existing incomplete screenshot requires reconciliation.')
            api('/v1/inAppPurchaseAppStoreReviewScreenshots/' + existing['id'], method='DELETE')
        image = voices if alias in ['daisy', 'mick'] else palettes
        screenshot = api('/v1/inAppPurchaseAppStoreReviewScreenshots', {'data': {
            'type': 'inAppPurchaseAppStoreReviewScreenshots',
            'attributes': {'fileName': 'n99-' + alias + '-native-review.png', 'fileSize': len(image)},
            'relationships': {'inAppPurchaseV2': {'data': {'type': 'inAppPurchases', 'id': identifier}}}}})['data']
        for operation in screenshot['attributes'].get('uploadOperations', []):
            if urllib.parse.urlsplit(operation['url']).scheme != 'https':
                raise ValueError('Screenshot uploads must use HTTPS')
            offset, length = operation['offset'], operation['length']
            if offset < 0 or length <= 0 or offset + length > len(image):
                raise ValueError('Invalid upload chunk bounds')
            req = urllib.request.Request(operation['url'], data=image[offset:offset + length],
                method=operation['method'], headers={h['name']: h['value'] for h in operation.get('requestHeaders', [])})
            # Only Apple's operation-specific upload headers go to storage; never the API JWT.
            with opener.open(req, timeout=60) as response:
                response.read()
        path = '/v1/inAppPurchaseAppStoreReviewScreenshots/' + screenshot['id']
        api(path, {'data': {'type': 'inAppPurchaseAppStoreReviewScreenshots', 'id': screenshot['id'],
            'attributes': {'uploaded': True, 'sourceFileChecksum': hashlib.md5(image).hexdigest()}}}, 'PATCH')
        state = None
        for _ in range(6):
            asset = api(path)['data']
            state = asset['attributes'].get('assetDeliveryState', {}).get('state')
            if state in ['COMPLETE', 'FAILED']:
                break
            time.sleep(5)
        product_state = api('/v2/inAppPurchases/' + identifier)['data']['attributes'].get('state')
        print(json.dumps({'product': alias, 'screenshotState': state, 'productState': product_state}), flush=True)
        if state == 'FAILED':
            raise SystemExit('Apple rejected a genuine review screenshot; inspect the delivery error before retrying.')
    print('Only review screenshots were updated. No purchase or production submission was made.')


if __name__ == '__main__':
    main()
