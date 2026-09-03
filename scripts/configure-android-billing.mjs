import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const appDir=path.join(root,'android','app');
const pkgDir=path.join(appDir,'src','main','java','com','pettygamesstudios','ninetynineimpossible');
await mkdir(pkgDir,{recursive:true});
await copyFile(path.join(root,'native','android','N99BillingPlugin.java'),path.join(pkgDir,'N99BillingPlugin.java'));

const manifestPath=path.join(appDir,'src','main','AndroidManifest.xml');
let manifest=await readFile(manifestPath,'utf8');
if(!manifest.includes('com.android.vending.BILLING')){
  manifest=manifest.replace('<application','<uses-permission android:name="com.android.vending.BILLING" />\n\n    <application');
  await writeFile(manifestPath,manifest);
}

const mainPath=path.join(pkgDir,'MainActivity.java');
let main=await readFile(mainPath,'utf8');
if(!main.includes('registerPlugin(N99BillingPlugin.class)')){
  main=main.replace('import com.getcapacitor.BridgeActivity;','import android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;');
  const emptyMain=/public class MainActivity extends BridgeActivity\s*\{\s*\}/m;
  if(!emptyMain.test(main))throw new Error('Unable to register N99BillingPlugin: generated MainActivity.java did not match the expected empty BridgeActivity class');
  main=main.replace(emptyMain,`public class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        registerPlugin(N99BillingPlugin.class);\n        super.onCreate(savedInstanceState);\n        bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);\n    }\n}`);
  await writeFile(mainPath,main);
}

const proguardPath=path.join(appDir,'proguard-rules.pro');
let proguard='';try{proguard=await readFile(proguardPath,'utf8')}catch{}
const keepRules=`\n# 99% Impossible local Capacitor billing plugin\n-keep classes com.pettygamesstudios.ninetynineimpossible.** { *; }\n-keepclasseswithmembers class * {\n    @com.getcapacitor.annotation.CapacitorPlugin <methods>;\n}\n`;
if(!proguard.includes('-keep classes com.pettygamesstudios.ninetynineimpossible.** { *; }')){proguard+=keepRules;await writeFile(proguardPath,proguard)}

const gradlePath=path.join(appDir,'build.gradle');
let gradle=await readFile(gradlePath,'utf8');
if(!gradle.includes('com.android.billingclient:billing:9.1.0'))gradle+=`\n\n// 99% Impossible native billing\ndependencies {\n    implementation "com.android.billingclient:billing:9.1.0"\n}\n`;
if(!gradle.includes('signingConfigs.n99Release'))gradle+=`\nandroid {\n    signingConfigs {\n        n99Release {\n            def ks = System.getenv("ANDROID_KEYSTORE_PATH")\n            if (ks) {\n                storeFile file(ks)\n                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")\n                keyAlias System.getenv("ANDROID_KEY_ALIAS")\n                keyPassword System.getenv("ANDROID_KEY_PASSWORD")\n            }\n        }\n    }\n    buildTypes {\n        release {\n            if (System.getenv("ANDROID_KEYSTORE_PATH")) signingConfig signingConfigs.n99Release\n        }\n    }\n}\n`;
gradle=gradle.replace(/versionCode\s+\d+/,'versionCode 10').replace(/versionName\s+"[^"]+"/,'versionName "1.0.9"');
await writeFile(gradlePath,gradle);

const variablesPath=path.join(root,'android','variables.gradle');
let variables=await readFile(variablesPath,'utf8');
variables=variables.replace(/compileSdkVersion\s*=\s*\d+/,'compileSdkVersion = 36').replace(/targetSdkVersion\s*=\s*\d+/,'targetSdkVersion = 36');
await writeFile(variablesPath,variables);
console.log('Android configured: API 36 + versionCode 10 + billing + WebView audio playback + Petty shim + native Share');
