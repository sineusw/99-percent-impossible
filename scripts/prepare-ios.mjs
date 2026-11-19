import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const run=(command,args)=>{const result=spawnSync(command,args,{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1)};
run('python3',['scripts/patch-admob-consent.py']);
if(!fs.existsSync('ios/App/App/Info.plist'))run('npx',['cap','add','ios']);
run('python3',['scripts/configure-ios-monetization.py']);
run('npx',['cap','sync','ios']);
