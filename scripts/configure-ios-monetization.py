"""Configure generated iOS metadata without inventing account identifiers."""
import json
import os
import plistlib
from pathlib import Path

config = json.loads(Path('native-monetization.json').read_text())
app_id = config.get('admobIosAppId')
# Google's official sample app ID supports test ads until the existing account is accessible.
if app_id is None:
    app_id = 'ca-app-pub-3940256099942544~1458002511'
import re
if not re.fullmatch(r'ca-app-pub-\d{16}~\d{10}', app_id):
    raise SystemExit('AdMob iOS App ID must be an app identifier containing ~, not an ad unit.')
for name in ('interstitialAdUnitId', 'rewardedAdUnitId'):
    unit = config.get(name)
    if unit is not None and (not isinstance(unit, str) or
                            not re.fullmatch(r'ca-app-pub-\d{16}/\d{10}', unit) or
                            unit.split('/')[0] != app_id.split('~')[0]):
        raise SystemExit(name + ' must be a valid ad unit belonging to the configured publisher.')
products = config.get('appleProducts', {})
required = {'daisy', 'mick', 'cyberpunk', 'goldonly', 'synthwave', 'ragepass'}
if products and (set(products) != required or len(set(products.values())) != 6 or
                 any(not isinstance(value, str) or not value.strip() for value in products.values())):
    raise SystemExit('Provide all six distinct, existing Apple product identifiers, or leave offers disabled.')
path = Path(os.environ.get('N99_IOS_INFO_PLIST', 'ios/App/App/Info.plist'))
with path.open('rb') as source:
    info = plistlib.load(source)
info['GADApplicationIdentifier'] = app_id
info['N99StoreKitProducts'] = products
with path.open('wb') as target:
    plistlib.dump(info, target)
print('Configured iOS App ID ' + app_id + '; requests remain test-only; Apple purchase catalog ' +
      ('configured' if products else 'disabled pending existing IDs'))

# StoreKit 2 requires iOS 15. Keep CocoaPods and the app target consistent.
project = path.parent.parent / 'App.xcodeproj/project.pbxproj'
podfile = path.parent.parent / 'Podfile'
if project.exists():
    project.write_text(re.sub(r'IPHONEOS_DEPLOYMENT_TARGET = [0-9.]+;',
                              'IPHONEOS_DEPLOYMENT_TARGET = 15.0;', project.read_text()))
if podfile.exists():
    podfile.write_text(re.sub(r"platform :ios, '[0-9.]+'", "platform :ios, '15.0'", podfile.read_text()))
