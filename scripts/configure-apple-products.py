"""Idempotently prepare the six authorized, missing non-consumable Apple products."""
import json
from decimal import Decimal
import urllib.error
import urllib.parse
import urllib.request
import importlib.util
from pathlib import Path
_spec = importlib.util.spec_from_file_location('apple_inspection', Path(__file__).with_name('inspect-apple-products.py'))
_helper = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_helper)
NoRedirect, token = _helper.NoRedirect, _helper.token

APP = '6809299092'
BUNDLE = 'com.pettygamesstudios.ninetynineimpossible'
PRODUCTS = [
    ('daisy', 'Daisy Voice Pack', 'Unlock Daisy voice and commentary.', '1.99'),
    ('mick', 'Mick Voice Pack', 'Unlock Mick voice and commentary.', '1.99'),
    ('cyberpunk', 'Cyberpunk Colors', 'Unlock the Cyberpunk color palette.', '1.99'),
    ('goldonly', 'Gold Only Colors', 'Unlock the Gold Only color palette.', '1.99'),
    ('synthwave', 'Synthwave Colors', 'Unlock the Synthwave color palette.', '1.99'),
    ('ragepass', 'Rage Pass', 'Unlock 3 premium palettes and remove ads.', '3.99'),
]


def main():
    auth = token()
    opener = urllib.request.build_opener(NoRedirect)

    def api(path, data=None, allow_missing=False):
        url = path if path.startswith('https://') else 'https://api.appstoreconnect.apple.com' + path
        if urllib.parse.urlsplit(url).netloc != 'api.appstoreconnect.apple.com':
            raise ValueError('Unexpected Apple API pagination host')
        req = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
              headers={'Authorization': 'Bearer ' + auth, 'Content-Type': 'application/json'})
        try:
            with opener.open(req, timeout=45) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if allow_missing and error.code == 404:
                return None
            try:
                details = json.loads(error.read()).get('errors', [])
            except ValueError:
                details = []
            print(json.dumps({'endpoint': urllib.parse.urlsplit(url).path, 'httpStatus': error.code,
                              'errors': [{k: e.get(k) for k in ['code', 'title', 'detail']} for e in details]}))
            raise SystemExit('Apple catalog preparation stopped; no submission or agreement acceptance performed.')

    def rows(path):
        result = []
        while path:
            page = api(path)
            result.extend(page.get('data', []))
            path = page.get('links', {}).get('next')
        return result

    def rel(kind, identifier):
        return {'data': {'type': kind, 'id': identifier}}

    app = api('/v1/apps/' + APP)['data']
    if app['attributes']['bundleId'] != BUNDLE:
        raise ValueError('Existing app bundle mismatch')
    existing = rows('/v1/apps/' + APP + '/inAppPurchasesV2?limit=200')
    by_product = {p['attributes']['productId']: p for p in existing}
    configured = {}
    for alias, name, description, price in PRODUCTS:
        product_id = BUNDLE + '.' + alias
        product = by_product.get(product_id)
        if product is None:
            # A similarly named existing product requires reconciliation, never duplication.
            if any(p['attributes']['name'].casefold() == name.casefold() for p in existing):
                raise SystemExit('Existing product name has another identifier; reconcile it before creating anything.')
            product = api('/v2/inAppPurchases', {'data': {'type': 'inAppPurchases',
                'attributes': {'name': name, 'productId': product_id, 'inAppPurchaseType': 'NON_CONSUMABLE'},
                'relationships': {'app': rel('apps', APP)}}})['data']
            print(json.dumps({'createdProduct': product_id, 'id': product['id']}), flush=True)
        if product['attributes']['inAppPurchaseType'] != 'NON_CONSUMABLE':
            raise ValueError('Existing product has an unexpected purchase type')
        identifier = product['id']
        localizations = rows('/v2/inAppPurchases/' + identifier + '/inAppPurchaseLocalizations?limit=200')
        if not any(p['attributes']['locale'] == 'en-US' for p in localizations):
            api('/v1/inAppPurchaseLocalizations', {'data': {'type': 'inAppPurchaseLocalizations',
                'attributes': {'name': name, 'locale': 'en-US', 'description': description},
                'relationships': {'inAppPurchaseV2': rel('inAppPurchases', identifier)}}})
        schedule = api('/v2/inAppPurchases/' + identifier + '/iapPriceSchedule', allow_missing=True)
        if not schedule or not schedule.get('data'):
            points = rows('/v2/inAppPurchases/' + identifier + '/pricePoints?filter[territory]=USA&limit=200')
            point = next((p for p in points if Decimal(p['attributes']['customerPrice']) == Decimal(price)), None)
            if point is None:
                raise ValueError('Apple has no matching USD price point')
            temporary = '${price-' + alias + '}'
            api('/v1/inAppPurchasePriceSchedules', {'data': {'type': 'inAppPurchasePriceSchedules',
                'relationships': {'inAppPurchase': rel('inAppPurchases', identifier),
                    'baseTerritory': rel('territories', 'USA'),
                    'manualPrices': {'data': [{'type': 'inAppPurchasePrices', 'id': temporary}]}}},
                'included': [{'type': 'inAppPurchasePrices', 'id': temporary,
                    'attributes': {'startDate': None, 'endDate': None},
                    'relationships': {'inAppPurchaseV2': rel('inAppPurchases', identifier),
                        'inAppPurchasePricePoint': rel('inAppPurchasePricePoints', point['id'])}}]})
        current = api('/v2/inAppPurchases/' + identifier)['data']
        configured[alias] = current['attributes']['productId']
        print(json.dumps({'preparedProduct': configured[alias], 'state': current['attributes'].get('state'),
                          'expectedUsdPrice': price}), flush=True)
    print(json.dumps({'appleProducts': configured}), flush=True)
    print('No review submission, purchase, legal agreement, territory expansion, or public TestFlight link was performed.')


if __name__ == '__main__':
    main()
