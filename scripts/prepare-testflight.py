"""Prepare one explicitly selected TestFlight build; never publish an App Store release."""
import importlib.util
import json
import os
import time
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
    for attempt in range(120):
        result = api('/v1/builds?filter[app]=' + APP + '&filter[version]=' + number + '&include=preReleaseVersion')
        rows = result.get('data', [])
        if len(rows) > 1:
            raise SystemExit('More than one exact build matched; no changes made.')
        if rows and rows[0]['attributes']['processingState'] == 'VALID':
            break
        if rows and rows[0]['attributes']['processingState'] in ['FAILED', 'INVALID']:
            raise SystemExit('Apple rejected processing for the selected build; no changes made.')
        print(json.dumps({'waitingForAppleProcessing': number, 'attempt': attempt + 1}), flush=True)
        time.sleep(10)
    else:
        raise SystemExit('The exact uploaded build is not processed yet. No changes made.')
    build = result['data'][0]
    version_id = build['relationships']['preReleaseVersion']['data']['id']
    version = next(p for p in result['included'] if p['id'] == version_id)['attributes']['version']
    expected_version = os.environ.get('TESTFLIGHT_MARKETING_VERSION', '1.0.1')
    if version != expected_version:
        raise ValueError('Selected build does not match the explicitly requested marketing version.')
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
    live_game_center = os.environ.get('TESTFLIGHT_LIVE_GAME_CENTER') == 'true'
    description = ('Three timing challenges: Perfect Timer, Perfect Stop and Reaction Test. '
                   'This beta tests native interstitial ads, Apple purchases, voice packs, palettes and restore.')
    if live_game_center:
        description += ' Optional Game Center sign-in enables live worldwide weekly leaderboards.'
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
    notes = 'Leaderboard beta: sample rank climbs, milestones, rotating Petty/Daisy/Mick reactions and local day/holiday commentary. Demo ranks are not live worldwide standings. Test all three games, repeated retry, sound/mute, interstitial loading/dismissal after several retries, six Apple sandbox purchases, voice/palette application, Rage Pass, and Restore Apple Purchases. Physical iPhone QA is pending.'
    if live_game_center:
        notes = ('Live weekly Game Center leaderboards: open LIVE LEADERBOARD on Home and connect Game Center. '
                 'Timer/Stop rank by perfect streak with close-miss ties; get one perfect to join. '
                 'Reaction ranks fastest valid times of 100ms or above. Check Home rank, three game tabs, '
                 'top 100, refresh and rank changes with Petty/Daisy/Mick matching audio/captions. '
                 'TestFlight sandbox standings are separate from the public app. Try offline/reconnect, '
                 'sound/mute, Apple sandbox purchases and restore. Real-device validation is pending.')
    if os.environ.get('TESTFLIGHT_DAILY_PROGRESS') == 'true':
        notes += (' New: three daily skill goals and permanent progress titles. Open See today’s goals on Home. '
                  'Check progress persists after restart and resets goals the next local day without losing titles. '
                  'Petty waits for your first interaction before generating a welcome and reuses short cached audio. '
                  'Normal ad breaks require at least 90 seconds from session start and between attempts; '
                  'round-count, consent and Rage Pass rules still apply. Test ads only; no real purchases required.')
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
                'hasAccessToAllBuilds': False},
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
            'attributes': {'publicLinkEnabled': True, 'publicLinkLimitEnabled': True, 'publicLinkLimit': 10}}}, 'PATCH')['data']
        # An approved build can still reject enrollment until testing is started.
        # Starting it through this endpoint also issues notifications. Only do so
        # when every associated group is empty: no one receives an unsolicited message.
        if state == 'BETA_APPROVED':
            # Apple does not support GET_RELATED on build.betaGroups.
            # Enumerate the app's groups and their supported builds relation instead.
            all_groups = api('/v1/apps/' + APP + '/betaGroups?limit=200')
            if all_groups.get('links', {}).get('next'):
                raise SystemExit('Cannot establish the complete notification audience; testing start held.')
            empty = True
            recipients = set()
            for linked_group in all_groups.get('data', []):
                assigned = api('/v1/betaGroups/' + linked_group['id'] + '/builds?limit=200')
                if assigned.get('links', {}).get('next'):
                    raise SystemExit('Cannot establish the complete group build list; testing start held.')
                if not any(row['id'] == identifier for row in assigned.get('data', [])):
                    continue
                audience = api('/v1/betaGroups/' + linked_group['id'] + '/relationships/betaTesters?limit=200')
                if audience.get('links', {}).get('next'):
                    raise SystemExit('Cannot establish notification recipients; testing start held.')
                recipients.update(row['id'] for row in audience.get('data', []))
                if audience.get('data'):
                    empty = False
            owner_email = os.environ.get('TESTFLIGHT_NOTIFY_OWNER_EMAIL', '').strip().lower()
            owner_only = False
            if owner_email and len(recipients) == 1:
                tester = api('/v1/betaTesters/' + next(iter(recipients)))['data']
                owner_only = tester['attributes'].get('email', '').strip().lower() == owner_email
            if empty or owner_only:
                api('/v1/buildBetaNotifications', {'data': {'type': 'buildBetaNotifications',
                    'relationships': {'build': rel('builds', identifier)}}}, 'POST')
                print(json.dumps({'testingStarted': number, 'notificationRecipients': len(recipients), 'verifiedOwnerOnly': owner_only}), flush=True)
                state = api('/v1/builds/' + identifier + '/buildBetaDetail')['data']['attributes']['externalBuildState']
            else:
                print(json.dumps({'testingStartHeld': number,
                                  'reason': 'Existing testers would receive a notification; no notifications sent.'}), flush=True)
        print(json.dumps({'testFlightLink': group['attributes'].get('publicLink'), 'buildNumber': number,
                          'externalBetaState': state}), flush=True)
    else:
        print(json.dumps({'buildNumber': number, 'externalBetaState': state,
                          'message': 'Distribution remains held pending explicit validation and Apple eligibility/review.'}), flush=True)


if __name__ == '__main__':
    main()
