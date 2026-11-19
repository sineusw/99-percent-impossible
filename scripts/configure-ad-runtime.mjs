import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('native-monetization.json','utf8'));
const mode=process.env.N99_AD_MODE||'test';
if(!['test','production'].includes(mode))throw new Error('N99_AD_MODE must be test or production');
const app=config.admobIosAppId,unit=config.interstitialAdUnitId;
if(mode==='production'&&(
  !/^ca-app-pub-\d{16}~\d{10}$/.test(app||'')||
  !/^ca-app-pub-\d{16}\/\d{10}$/.test(unit||'')||
  app.split('~')[0]!==unit.split('/')[0]||app.includes('3940256099942544')
))throw new Error('Production ads require verified matching real iOS app/ad-unit identifiers');
const testingDevices=(process.env.N99_AD_TEST_DEVICE_IDS||'').split(',').map(id=>id.trim()).filter(Boolean);
if(testingDevices.some(id=>!/^[a-fA-F0-9]{32}$/.test(id)))throw new Error('Invalid Google test-device identifier');
const runtime={mode,iosInterstitialAdUnitId:mode==='production'?unit:null,testingDevices};
fs.writeFileSync('dist/native-ad-config.js','window.N99AdConfig=Object.freeze('+JSON.stringify(runtime)+');\n');
console.log('Staged native ads mode: '+mode+'; test devices: '+testingDevices.length);
