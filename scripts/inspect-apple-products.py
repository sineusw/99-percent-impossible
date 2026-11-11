"""Read existing app/product metadata through the repository's existing Apple API key."""
import base64
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=')


def integer(data, pos):
    if data[pos] != 2:
        raise ValueError('Invalid ECDSA signature')
    size = data[pos + 1]
    value = int.from_bytes(data[pos + 2:pos + 2 + size], 'big')
    return value.to_bytes(32, 'big'), pos + 2 + size


def token():
    now = int(time.time())
    header = b64(json.dumps({'alg': 'ES256', 'kid': os.environ['ASC_KEY_ID'], 'typ': 'JWT'}).encode())
    payload = b64(json.dumps({'iss': os.environ['ASC_ISSUER_ID'], 'iat': now - 30,
                              'exp': now + 600, 'aud': 'appstoreconnect-v1'}).encode())
    unsigned = header + b'.' + payload
    with tempfile.TemporaryDirectory() as directory:
        key = Path(directory) / 'apple.p8'
        key.write_bytes(base64.b64decode(os.environ['ASC_PRIVATE_KEY'], validate=False))
        key.chmod(0o600)
        signature = subprocess.run(['openssl', 'dgst', '-sha256', '-sign', str(key)],
                                   input=unsigned, capture_output=True, check=True).stdout
    if signature[0] != 0x30 or signature[1] >= 0x80:
        raise ValueError('Invalid ECDSA signature sequence')
    r, pos = integer(signature, 2)
    s, _ = integer(signature, pos)
    return (unsigned + b'.' + b64(r + s)).decode()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def inspect():
    auth = token()
    opener = urllib.request.build_opener(NoRedirect)

    def read(path):
        url = 'https://api.appstoreconnect.apple.com' + path
        req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + auth})
        try:
            with opener.open(req, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            print(json.dumps({'endpoint': path.split('?')[0], 'httpStatus': error.code}))
            return None

    app = read('/v1/apps/6809299092?fields[apps]=name,bundleId,sku')
    if app:
        attributes = app['data']['attributes']
        if attributes.get('bundleId') != 'com.pettygamesstudios.ninetynineimpossible':
            raise ValueError('Apple app bundle does not match; stopping inspection')
        print(json.dumps({'app': {'id': app['data']['id'], **attributes}}))
    else:
        raise SystemExit('Existing Apple app could not be read; no account changes made.')
    products = read('/v1/apps/6809299092/inAppPurchasesV2?limit=200')
    if products is not None:
        print(json.dumps({'existingInAppPurchases': [
            {'id': row['id'], **{key: row['attributes'].get(key) for key in
             ['name', 'productId', 'inAppPurchaseType', 'state']}}
            for row in products.get('data', [])], 'hasMore': bool(products.get('links', {}).get('next'))}))
    versions = read('/v1/apps/6809299092/appStoreVersions?limit=10')
    if versions is not None:
        print(json.dumps({'versions': [
            {key: row['attributes'].get(key) for key in ['versionString', 'appStoreState', 'platform']}
            for row in versions.get('data', [])]}))
    groups = read('/v1/apps/6809299092/betaGroups?limit=100')
    if groups is not None:
        print(json.dumps({'testFlightGroups': [
            {'id': row['id'], **{key: row['attributes'].get(key) for key in
             ['name', 'isInternalGroup', 'publicLinkEnabled', 'publicLink']}}
            for row in groups.get('data', [])]}))


if __name__ == '__main__':
    inspect()
