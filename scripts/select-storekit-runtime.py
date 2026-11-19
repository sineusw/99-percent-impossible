"""Select the installed iOS 26.2 runtime, avoiding the known 26.5 StoreKit Test regression."""
import json
import sys

runtimes = json.load(sys.stdin)['runtimes']
working = [r for r in runtimes if r.get('isAvailable') and
           r['identifier'].startswith('com.apple.CoreSimulator.SimRuntime.iOS-') and
           tuple(map(int, r['version'].split('.')[:2])) == (26, 2)]
if not working:
    raise SystemExit('iOS 26.2 runtime is required for StoreKit Test. Do not silently select affected iOS 26.5.')
print(working[0]['identifier'])
