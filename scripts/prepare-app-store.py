"""Prepare/submit the explicitly selected production build, using existing app metadata."""
import importlib.util,json,os,time,urllib.request,urllib.error
from pathlib import Path
spec=importlib.util.spec_from_file_location('apple',Path(__file__).with_name('inspect-apple-products.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
APP='6809299092';VERSION='1.0.2'
auth=h.token();opener=urllib.request.build_opener(h.NoRedirect)
def api(path,data=None,method=None):
 req=urllib.request.Request('https://api.appstoreconnect.apple.com'+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Authorization':'Bearer '+auth,'Content-Type':'application/json'})
 try:
  with opener.open(req,timeout=45) as r:
   b=r.read();return json.loads(b) if b else {}
 except urllib.error.HTTPError as e:
  print(json.dumps({'endpoint':path.split('?')[0],'status':e.code,'error':json.loads(e.read()).get('errors',[])}));raise SystemExit('Apple operation stopped; inspect the reported account requirement.')
def rel(t,i):return {'data':{'type':t,'id':i}}
def create(t,attrs,rels):return api('/v1/'+t,{'data':{'type':t,'attributes':attrs,'relationships':rels}})['data']
def patch(t,i,attrs):return api('/v1/'+t+'/'+i,{'data':{'type':t,'id':i,'attributes':attrs}},'PATCH')
app=api('/v1/apps/'+APP)['data'];assert app['attributes']['bundleId']=='com.pettygamesstudios.ninetynineimpossible'
versions=api('/v1/apps/'+APP+'/appStoreVersions?limit=30')['data'];live=next(x for x in versions if x['attributes']['platform']=='IOS' and x['attributes']['appStoreState']=='READY_FOR_SALE')
print(json.dumps({'liveVersion':live['attributes']['versionString']}))
mode=os.environ.get('STORE_OPERATION','inspect')
if mode=='inspect':
 for v in versions:
  print(json.dumps({'version':v['id'],'attributes':v['attributes']}))
  if v['id']==live['id']:
   locs=api('/v1/appStoreVersions/'+v['id']+'/appStoreVersionLocalizations')['data']
   for l in locs:
    print(json.dumps({'localization':l['id'],'attributes':l['attributes']}))
    sets=api('/v1/appStoreVersionLocalizations/'+l['id']+'/appScreenshotSets')['data']
    for s in sets:
     pics=api('/v1/appScreenshotSets/'+s['id']+'/appScreenshots')['data']
     print(json.dumps({'screenshots':s['attributes'],'count':len(pics)}))
   detail=api('/v1/appStoreVersions/'+v['id']+'/appStoreReviewDetail')['data']
   print(json.dumps({'reviewContactComplete':bool(detail and all(detail['attributes'].get(k) for k in ['contactFirstName','contactLastName','contactPhone','contactEmail']))}))
 center=api('/v1/apps/'+APP+'/gameCenterDetail')['data'];releases=api('/v1/gameCenterDetails/'+center['id']+'/leaderboardReleases')['data'];print(json.dumps({'leaderboardReleases':releases}))
 raise SystemExit(0)
number=os.environ['STORE_BUILD_NUMBER'];assert number.isdigit()
for attempt in range(45):
 rows=api('/v1/builds?filter[app]='+APP+'&filter[version]='+number+'&include=preReleaseVersion')
 assert len(rows['data'])<=1,'Ambiguous exact build'
 if rows['data']:
  build=rows['data'][0]
  assert build['attributes']['processingState'] not in ['FAILED','INVALID'],'Build processing failed'
  if build['attributes']['processingState']=='VALID' and not build['attributes']['expired']:break
 print(json.dumps({'waitingForProcessedBuild':number,'attempt':attempt+1}),flush=True);time.sleep(10)
else:raise SystemExit('Selected build not processed yet; version was not changed.')
assert any(x['attributes']['version']==VERSION for x in rows['included'] if x['type']=='preReleaseVersions')
if build['attributes'].get('usesNonExemptEncryption') is None:patch('builds',build['id'],{'usesNonExemptEncryption':False})
v=next((x for x in versions if x['attributes']['platform']=='IOS' and x['attributes']['versionString']==VERSION),None)
if v is None:v=create('appStoreVersions',{'platform':'IOS','versionString':VERSION,'releaseType':'AFTER_APPROVAL','copyright':live['attributes'].get('copyright','2026 Petty Games Studios')},{'app':rel('apps',APP)})
assert v['attributes']['appStoreState'] in ['PREPARE_FOR_SUBMISSION','DEVELOPER_REJECTED','REJECTED','METADATA_REJECTED'],'Version is already submitted or not editable'
api('/v1/appStoreVersions/'+v['id']+'/relationships/build',rel('builds',build['id']),'PATCH')
notes='New look, sharper competition.\n\n• Redesigned Home screen and colorful leaderboard.\n• Weekly Game Center rankings across all three challenges.\n• Rank reactions from Petty, Daisy and Mick.\n• Daily skill challenges and earned titles.\n• Improved startup, fullscreen layout and voice playback.'
oldlocs=api('/v1/appStoreVersions/'+live['id']+'/appStoreVersionLocalizations')['data'];newlocs=api('/v1/appStoreVersions/'+v['id']+'/appStoreVersionLocalizations')['data']
for old in oldlocs:
 a=old['attributes'];attrs={k:a[k] for k in ['description','keywords','marketingUrl','supportUrl','promotionalText'] if a.get(k) is not None};attrs['whatsNew']=notes
 existing=next((l for l in newlocs if l['attributes']['locale']==a['locale']),None)
 if existing:patch('appStoreVersionLocalizations',existing['id'],attrs)
 else:create('appStoreVersionLocalizations',{'locale':a['locale'],**attrs},{'appStoreVersion':rel('appStoreVersions',v['id'])})
old=api('/v1/appStoreVersions/'+live['id']+'/appStoreReviewDetail')['data'];new=api('/v1/appStoreVersions/'+v['id']+'/appStoreReviewDetail')['data']
assert old and all(old['attributes'].get(k) for k in ['contactFirstName','contactLastName','contactPhone','contactEmail'])
attrs={k:old['attributes'][k] for k in ['contactFirstName','contactLastName','contactPhone','contactEmail']};attrs.update({'demoAccountRequired':False,'notes':'Three skill games. Game Center sign-in is optional and uses Apple Game Center; play remains available signed out. Weekly Timer/Stop boards rank perfect streaks with closest first miss as a tiebreaker; Reaction ranks fastest valid times >=100ms. Empty boards truthfully show no players. Optional voice/color non-consumables and Rage Pass use approved Apple products. Restore Apple Purchases is in Colors. Rage Pass removes interstitials. Native app contains no web checkout. Daily progress and titles are local. Production AdMob consent/privacy controls are available; ad availability depends on consent and inventory.'})
if new:patch('appStoreReviewDetails',new['id'],attrs)
else:create('appStoreReviewDetails',attrs,{'appStoreVersion':rel('appStoreVersions',v['id'])})
# Enable the version's Game Center integration and release only this app's boards.
gc=api('/v1/appStoreVersions/'+v['id']+'/gameCenterAppVersion').get('data')
if gc:patch('gameCenterAppVersions',gc['id'],{'enabled':True})
else:
 gc=create('gameCenterAppVersions',{}, {'appStoreVersion':rel('appStoreVersions',v['id'])})
 patch('gameCenterAppVersions',gc['id'],{'enabled':True})
center=api('/v1/apps/'+APP+'/gameCenterDetail')['data']
released=api('/v1/gameCenterDetails/'+center['id']+'/leaderboardReleases?include=gameCenterLeaderboard')['data']
boards=api('/v1/gameCenterDetails/'+center['id']+'/gameCenterLeaderboards')['data']
for board in boards:
 assert board['attributes']['vendorIdentifier'].startswith('com.pettygamesstudios.ninetynineimpossible.')
 if not any(r.get('relationships',{}).get('gameCenterLeaderboard',{}).get('data',{}).get('id')==board['id'] for r in released):
  result=create('gameCenterLeaderboardReleases',{}, {'gameCenterDetail':rel('gameCenterDetails',center['id']),'gameCenterLeaderboard':rel('gameCenterLeaderboards',board['id'])})
  print(json.dumps({'leaderboardRelease':result['id'],'board':board['attributes']['vendorIdentifier']}))
for l in api('/v1/appStoreVersions/'+v['id']+'/appStoreVersionLocalizations')['data']:
 sets=api('/v1/appStoreVersionLocalizations/'+l['id']+'/appScreenshotSets')['data']
 for ss in sets:
  pics=api('/v1/appScreenshotSets/'+ss['id']+'/appScreenshots')['data']
  print(json.dumps({'candidateScreenshots':ss['attributes']['screenshotDisplayType'],'count':len(pics)}))
print(json.dumps({'preparedVersion':v['id'],'version':VERSION,'build':number,'releaseType':'AFTER_APPROVAL'}))
if mode=='submit':
 # Apple performs final metadata/screenshot/review validation; never claim live on submission.
 submission=create('appStoreVersionSubmissions',{}, {'appStoreVersion':rel('appStoreVersions',v['id'])})
 print(json.dumps({'submitted':submission['id'],'version':VERSION,'build':number}))
print(json.dumps({'versionState':api('/v1/appStoreVersions/'+v['id'])['data']['attributes']['appStoreState']}))
