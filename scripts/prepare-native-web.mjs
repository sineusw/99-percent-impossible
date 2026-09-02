import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'www');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});

const rootFile=/\.(?:html|css|js|json|png|jpe?g|webp|svg|mp3|m4a|wav|ico)$/i;
for(const entry of await readdir(root,{withFileTypes:true})){
  if(entry.name==='assets'&&entry.isDirectory()){
    await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
    continue;
  }
  if(entry.isFile()&&rootFile.test(entry.name)){
    await cp(path.join(root,entry.name),path.join(out,entry.name));
  }
}
console.log('Prepared Capacitor web assets in www/');
