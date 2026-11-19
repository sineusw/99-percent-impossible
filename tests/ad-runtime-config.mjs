import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const script=new URL('../scripts/configure-ad-runtime.mjs',import.meta.url);
const verified=JSON.parse(fs.readFileSync(new URL('../native-monetization.json',import.meta.url),'utf8'));
let count=0;
function run(mode,config=verified,devices=''){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'n99-ad-config-'));
 try{
  fs.mkdirSync(path.join(dir,'dist'));fs.writeFileSync(path.join(dir,'native-monetization.json'),JSON.stringify(config));
  const result=spawnSync(process.execPath,[script.pathname],{cwd:dir,env:{...process.env,N99_AD_MODE:mode,N99_AD_TEST_DEVICE_IDS:devices},encoding:'utf8'});
  let runtime;
  if(result.status===0){const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'dist/native-ad-config.js'),'utf8'),context);runtime=JSON.parse(JSON.stringify(context.window.N99AdConfig))}
  return {status:result.status,runtime};
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
}
function check(name,fn){fn();count++;console.log('PASS',name)}
check('Default QA bundle omits live unit',()=>{const r=run('');assert.equal(r.status,0);assert.equal(r.runtime.mode,'test');assert.equal(r.runtime.iosInterstitialAdUnitId,null)});
check('Production bundle has the verified iOS unit',()=>{const r=run('production');assert.equal(r.status,0);assert.equal(r.runtime.iosInterstitialAdUnitId,verified.interstitialAdUnitId)});
check('Missing production unit fails the build',()=>assert.notEqual(run('production',{...verified,interstitialAdUnitId:null}).status,0));
check('Google sample publisher cannot enter production',()=>assert.notEqual(run('production',{admobIosAppId:'ca-app-pub-3940256099942544~1458002511',interstitialAdUnitId:'ca-app-pub-3940256099942544/4411468910'}).status,0));
check('Different-publisher production unit fails the build',()=>assert.notEqual(run('production',{...verified,interstitialAdUnitId:'ca-app-pub-1111111111111111/1111111111'}).status,0));
check('Unknown ad mode and invalid test-device ID fail the build',()=>{assert.notEqual(run('live').status,0);assert.notEqual(run('production',verified,'not-a-device').status,0)});
check('Registered test-device IDs are carried into production configuration',()=>{const r=run('production',verified,'A'.repeat(32));assert.equal(r.status,0);assert.equal(r.runtime.testingDevices[0],'A'.repeat(32))});
console.log(`${count} ad build configuration checks passed`);
