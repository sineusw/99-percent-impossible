"""Allow pinned AdMob 7.2.0 UMP forms before MobileAds.start()."""
from pathlib import Path
import json

root = Path('node_modules/@capacitor-community/admob')
if json.loads((root / 'package.json').read_text())['version'] != '7.2.0':
    raise SystemExit('Review the consent bridge patch before upgrading AdMob.')
path = root / 'ios/Sources/AdMobPlugin/AdMobPlugin.swift'
source = path.read_text()
marker = '        // N99: consent forms must work before MobileAds.start().\n        self.consentExecutor.plugin = self\n'
anchor = '    @objc func requestConsentInfo(_ call: CAPPluginCall) {\n'
if marker not in source:
    if source.count(anchor) != 1:
        raise SystemExit('Pinned AdMob consent bridge changed; refusing an unverified patch.')
    path.write_text(source.replace(anchor, anchor + marker))
print('Prepared UMP before ad SDK initialization.')
