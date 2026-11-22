"""Idempotently configure Game Center on the existing app; never submit an App Store release."""
import importlib.util
import json
import urllib.request
import urllib.error

spec = importlib.util.spec_from_file_location('apple', 'scripts/inspect-apple-products.py')
apple = importlib.util.module_from_spec(spec)
spec.loader.exec_module(apple)
headers = {'Authorization': 'Bearer ' + apple.token(), 'Content-Type': 'application/json'}

def request(path, data=None):
    req = urllib.request.Request('https://api.appstoreconnect.apple.com' + path,
        headers=headers, data=json.dumps({'data': data}).encode() if data else None)
    try:
        with urllib.request.urlopen(req, timeout=40) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        print(error.read().decode())
        raise SystemExit('Apple configuration failed: HTTP ' + str(error.code))

def relation(kind, identifier):
    return {'data': {'type': kind, 'id': identifier}}

app = request('/v1/apps/6809299092')['data']
assert app['attributes']['bundleId'] == 'com.pettygamesstudios.ninetynineimpossible'
bundles = request('/v1/bundleIds?filter[identifier]=com.pettygamesstudios.ninetynineimpossible')['data']
assert len(bundles) == 1
bundle = bundles[0]['id']
caps = request('/v1/bundleIds/' + bundle + '/bundleIdCapabilities')['data']
if not any(x['attributes']['capabilityType'] == 'GAME_CENTER' for x in caps):
    request('/v1/bundleIdCapabilities', {'type': 'bundleIdCapabilities',
        'attributes': {'capabilityType': 'GAME_CENTER'},
        'relationships': {'bundleId': relation('bundleIds', bundle)}})
print('Game Center signing capability enabled for existing bundle ' + bundle)
center = request('/v1/apps/6809299092/gameCenterDetail')['data']
if not center:
    center = request('/v1/gameCenterDetails', {'type': 'gameCenterDetails',
        'relationships': {'app': relation('apps', '6809299092')}})['data']
center_id = center['id']
boards = request('/v1/gameCenterDetails/' + center_id + '/gameCenterLeaderboards?limit=200')['data']
for game, name, sort, end in [('timer', 'Perfect Timer Streak', 'DESC', '1000001000000'),
                              ('stop', 'Perfect Stop Streak', 'DESC', '1000001000000'),
                              ('reaction', 'Fastest Reaction', 'ASC', '60000')]:
    vendor = 'com.pettygamesstudios.ninetynineimpossible.' + game + '.v1'
    matches = [x for x in boards if x['attributes']['vendorIdentifier'] == vendor]
    assert len(matches) <= 1
    if matches:
        board = matches[0]
        assert board['attributes']['scoreSortType'] == sort
    else:
        board = request('/v1/gameCenterLeaderboards', {'type': 'gameCenterLeaderboards',
            'attributes': {'referenceName': name, 'vendorIdentifier': vendor,
                'defaultFormatter': 'INTEGER', 'submissionType': 'BEST_SCORE',
                'scoreSortType': sort, 'scoreRangeStart': '100' if game == 'reaction' else '1000001',
                'scoreRangeEnd': end},
            'relationships': {'gameCenterDetail': relation('gameCenterDetails', center_id)}})['data']
    localizations = request('/v1/gameCenterLeaderboards/' + board['id'] + '/localizations')['data']
    if not any(x['attributes']['locale'] == 'en-US' for x in localizations):
        request('/v1/gameCenterLeaderboardLocalizations', {'type': 'gameCenterLeaderboardLocalizations',
            'attributes': {'locale': 'en-US', 'name': name, 'formatterSuffix': ' ms' if game == 'reaction' else ' points',
                           'formatterSuffixSingular': ' ms' if game == 'reaction' else ' point'},
            'relationships': {'gameCenterLeaderboard': relation('gameCenterLeaderboards', board['id'])}})
    print(json.dumps({'game': game, 'id': board['id'], 'vendorIdentifier': vendor,
                      'sort': sort, 'leaderboardType': board['attributes'].get('leaderboardType')}))
print('Configured existing app for Game Center sandbox testing; no App Store release submitted.')
