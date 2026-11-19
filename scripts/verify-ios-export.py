"""Validate the real exported iOS archive before an App Store upload."""
import os
import json
import plistlib
from datetime import datetime, timezone
from pathlib import Path

app = Path(os.environ['RELEASE_APP_PATH'])
profile_path = Path(os.environ['RELEASE_PROFILE_PATH'])
certificate_path = Path(os.environ['RELEASE_CERTIFICATE_PATH'])
with (app / 'Info.plist').open('rb') as f:
    info = plistlib.load(f)
with profile_path.open('rb') as f:
    profile = plistlib.load(f)
bundle = os.environ['BUNDLE_ID']
team = os.environ['TEAM_ID']
assert info['CFBundleIdentifier'] == bundle, 'Exported bundle identifier mismatch'
assert info['CFBundleShortVersionString'] == os.environ.get('RELEASE_VERSION', '1.0'), 'Exported version mismatch'
assert info['CFBundleVersion'] == os.environ['GITHUB_RUN_ID'] + os.environ['GITHUB_RUN_ATTEMPT'], 'Build number mismatch'
assert team in profile['TeamIdentifier'], 'Provisioning team mismatch'
assert profile['Entitlements']['application-identifier'] == team + '.' + bundle, 'Profile application identifier mismatch'
assert not profile['Entitlements'].get('get-task-allow', False), 'Development entitlement in distribution export'
assert 'ProvisionedDevices' not in profile, 'Ad hoc/development provisioning profile in store export'
assert not profile.get('ProvisionsAllDevices', False), 'Enterprise profile in store export'
assert profile['ExpirationDate'].replace(tzinfo=timezone.utc) > datetime.now(timezone.utc), 'Expired provisioning profile'
assert certificate_path.read_bytes() in profile['DeveloperCertificates'], 'Signing certificate is not in the provisioning profile'
mode = os.environ.get('N99_AD_MODE', 'test')
assert info.get('N99AdMode') == mode, 'Native ad mode mismatch'
assert info.get('GADDelayAppMeasurementInit') is True, 'Ad measurement must wait for consent'
config_path = app / 'public/native-ad-config.js'
runtime = config_path.read_text().strip()
prefix = 'window.N99AdConfig=Object.freeze('
assert runtime.startswith(prefix) and runtime.endswith(');'), 'Missing generated ad runtime'
config = json.loads(runtime[len(prefix):-2])
assert config['mode'] == mode, 'Bundled web/native ad modes disagree'
if mode == 'production':
    expected = json.loads(Path('native-monetization.json').read_text())
    assert info['GADApplicationIdentifier'] == expected['admobIosAppId'], 'Wrong production app ID'
    assert config['iosInterstitialAdUnitId'] == expected['interstitialAdUnitId'], 'Wrong production unit'
    assert '3940256099942544' not in info['GADApplicationIdentifier'], 'Sample app ID in production'
else:
    assert config['iosInterstitialAdUnitId'] is None, 'QA must not bundle a live request configuration'
assert not list(app.rglob('*.storekit')), 'StoreKit QA fixture leaked into release'
print('Verified exported bundle, version, build number, store profile, team, expiry, and signing certificate match.')
print('Verified native/bundled ad mode, consent delay, configured identifiers, and absence of StoreKit fixtures.')
