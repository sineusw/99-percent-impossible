"""Prepare one explicitly selected TestFlight build; never publish an App Store release."""
import importlib.util
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

spec = importlib.util.spec_from_file_location('apple_helper', Path(__file__).with_name('inspect-apple-products.py'))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
APP = '6809299092'
GROUP = '99 Percent Impossible iPhone Test'


def main():
    number = os.environ.get('TESTFLIGHT_BUILD_NUMBER', '')
    if not number.isdigit():
        raise SystemExit('An exact uploaded test build number is required.')
    opener = urllib.request.build_opener(helper.NoRedirect)
    auth = helper.token()

    def api(path, data=None, method=None):
        req = urllib.request.Request('https://api.appstoreconnect.apple.com' + path,
            data=json.dumps(data).encode() if data is not None else None, method=method,
            headers={'Authorization': 'Bearer ' + auth, 'Content-Type': 'application/json'})
        try:
            with opener.open(req, timeout=45) as response:
                body = response.read()
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as error:
            try: details = json.loads(error.read()).get('errors', [])
            except ValueError: details = []
            print(json.dumps({'endpoint': path.split('?')[0], 'status': error.code,
                              'errors': [{k: e.get(k) for k in ['code', 'title', 'detail']} for e in details]}))
            raise SystemExit('TestFlight preparation stopped; no production release or email invitation was sent.')

    def rel(kind, identifier):
        return {'data': {'type': kind, 'id': identifier}}

    app = api('/v1/apps/' + APP)['data']
    if app['attributes']['bundleId'] != 'com.pettygamesstudios.ninetynineimpossible':
        raise ValueError('Wrong existing app')
    result = api('/v1/builds?filter[app]=' + APP + '&filter[version]=' + number + '&include=preReleaseVersion')
    if len(result.get('data', [])) != 1:
        raise SystemExit('The exact uploaded build is not available yet. No changes made.')
    build = result['data'][0]
    version_id = build['relationships']['preReleaseVersion']['data']['id']
    version = next(p for p in result['included'] if p['id'] == version_id)['attributes']['version']
    if version != '1.0.1':
        raise ValueError('This helper accepts only the explicitly prepared 1.0.1 test candidate.')
    if build['attributes']['processingState'] != 'VALID':
        print(json.dumps({'build': number, 'processingState': build['attributes']['processingState']}))
        return
    identifier = build['id']
    # Preserve the published app's existing answer: this candidate adds only
    # Apple/Google SDK and HTTPS transport, with no custom non-exempt encryption.
    if build['attributes'].get('usesNonExemptEncryption') is None:
        api('/v1/builds/' + identifier, {'data': {'type': 'builds', 'id': identifier,
             'attributes': {'usesNonExemptEncryption': False}}}, 'PATCH')
    review = api('/v1/apps/' + APP + '/betaAppReviewDetail')['data']
    if not all(review['attributes'].get(k) for k in
               ['contactFirstName', 'contactLastName', 'contactPhone', 'contactEmail']):
        raise SystemExit('Existing beta review contact information is incomplete.')
    api('/v1/betaAppReviewDetails/' + review['id'], {'data': {'type': 'betaAppReviewDetails',
        'id': review['id'], 'attributes': {'demoAccountRequired': False,
        'notes': 'Beta test only. Three timing games. Native ads use official Google test units. '
                 'Six optional non-consumables use Apple sandbox purchases: Daisy/Mick voices, '
                 'Cyberpunk/Gold Only/Synthwave colors, and Rage Pass. Rage Pass unlocks all three '
                 'palettes and suppresses interstitials. Restore Apple Purchases is in Colors. '
                 'No Stripe checkout is available inside the native app.'}}}, 'PATCH')
    description = ('Three timing challenges: Perfect Timer, Perfect Stop and Reaction Test. '
                   'This beta tests native Google test ads, Apple purchases, voice packs, palettes and restore.')
    localizations = api('/v1/apps/' + APP + '/betaAppLocalizations')['data']
    english = next((p for p in localizations if p['attributes']['locale'] == 'en-US'), None)
    attrs = {'description': description, 'feedbackEmail': '99percentimpossiblegame@gmail.com',
             'marketingUrl': 'https://99-percent-impossible.vercel.app/',
             'privacyPolicyUrl': 'https://99-percent-impossible.vercel.app/privacy.html'}
    if english:
        api('/v1/betaAppLocalizations/' + english['id'], {'data': {'type': 'betaAppLocalizations',
            'id': english['id'], 'attributes': attrs}}, 'PATCH')
    else:
        api('/v1/betaAppLocalizations', {'data': {'type': 'betaAppLocalizations',
            'attributes': {'locale': 'en-US', **attrs}, 'relationships': {'app': rel('apps', APP)}}})
    notes = 'Test all three games, repeated retry, sound/mute, native test ads after several retries, six Apple sandbox purchases, voice/palette application, Rage Pass, and Restore Apple Purchases. Physical iPhone QA is pending.'
    build_localizations = api('/v1/builds/' + identifier + '/betaBuildLocalizations')['data']
    english_build = next((p for p in build_localizations if p['attributes']['locale'] == 'en-US'), None)
    if english_build:
        api('/v1/betaBuildLocalizations/' + english_build['id'], {'data': {'type': 'betaBuildLocalizations',
            'id': english_build['id'], 'attributes': {'whatsNew': notes}}}, 'PATCH')
    else:
        api('/v1/betaBuildLocalizations', {'data': {'type': 'betaBuildLocalizations',
            'attributes': {'locale': 'en-US', 'whatsNew': notes},
            'relationships': {'build': rel('builds', identifier)}}})
    groups = api('/v1/apps/' + APP + '/betaGroups?limit=100')['data']
    group = next((g for g in groups if g['attributes']['name'] == GROUP), None)
    if group is None:
        group = api('/v1/betaGroups', {'data': {'type': 'betaGroups',
            'attributes': {'name': GROUP, 'isInternalGroup': False, 'publicLinkEnabled': False,
                'publicLinkLimitEnabled': True, 'publicLinkLimit': 10, 'hasAccessToAllBuilds': False},
            'relationships': {'app': rel('apps', APP)}}})['data']
    detail = api('/v1/builds/' + identifier + '/buildBetaDetail')['data']
    api('/v1/buildBetaDetails/' + detail['id'], {'data': {'type': 'buildBetaDetails', 'id': detail['id'],
        'attributes': {'autoNotifyEnabled': False}}}, 'PATCH')
    state = detail['attributes']['externalBuildState']
    if state == 'READY_FOR_BETA_SUBMISSION' and os.environ.get('TESTFLIGHT_SUBMIT_REVIEW') == 'true':
        submission = api('/v1/betaAppReviewSubmissions', {'data': {'type': 'betaAppReviewSubmissions',
            'relationships': {'build': rel('builds', identifier)}}})['data']
        print(json.dumps({'betaSubmission': submission['id'], 'buildNumber': number}), flush=True)
        state = api('/v1/builds/' + identifier + '/buildBetaDetail')['data']['attributes']['externalBuildState']
    if state in ['READY_FOR_BETA_TESTING', 'IN_BETA_TESTING', 'BETA_APPROVED'] and os.environ.get('TESTFLIGHT_ENABLE_DISTRIBUTION') == 'true':
        group_builds = api('/v1/betaGroups/' + group['id'] + '/builds?limit=200')['data']
        if not any(p['id'] == identifier for p in group_builds):
            api('/v1/betaGroups/' + group['id'] + '/relationships/builds',
                {'data': [{'type': 'builds', 'id': identifier}]}, 'POST')
        group = api('/v1/betaGroups/' + group['id'], {'data': {'type': 'betaGroups', 'id': group['id'],
            'attributes': {'publicLinkEnabled': True}}}, 'PATCH')['data']
        print(json.dumps({'testFlightLink': group['attributes'].get('publicLink'), 'buildNumber': number}), flush=True)
    else:
        print(json.dumps({'buildNumber': number, 'externalBetaState': state,
                          'message': 'Distribution remains held pending explicit validation and Apple eligibility/review.'}), flush=True)


if __name__ == '__main__':
    main()
