const crypto=require('crypto');
const ALLOWED_ITEMS=new Set(['daisy','mick','cyberpunk','goldonly','synthwave','ragepass']);
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json');res.end(JSON.stringify(body));}
function hashBuyerKey(value){return crypto.createHash('sha256').update(String(value)).digest('hex');}
function entitlementSecret(){const source=process.env.ENTITLEMENT_SECRET||process.env.STRIPE_SECRET_KEY;return crypto.createHmac('sha256',source).update('n99-entitlements-v1').digest();}
function safeEqual(a,b){const left=Buffer.from(String(a||''));const right=Buffer.from(String(b||''));return left.length===right.length&&crypto.timingSafeEqual(left,right);}
function verifyToken(token,secret){if(typeof token!=='string')return null;const parts=token.split('.');if(parts.length!==2)return null;const [encoded,signature]=parts;const expected=crypto.createHmac('sha256',secret).update(encoded).digest('base64url');if(!safeEqual(signature,expected))return null;try{return JSON.parse(Buffer.from(encoded,'base64url').toString('utf8'));}catch{return null;}}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  if(!process.env.STRIPE_SECRET_KEY)return json(res,503,{error:'payments_not_configured'});
  const {token,buyerKey}=req.body||{};
  if(typeof buyerKey!=='string'||buyerKey.length<20||buyerKey.length>200)return json(res,400,{error:'invalid_request'});
  const payload=verifyToken(token,entitlementSecret());
  const expectedBuyerHash=hashBuyerKey(buyerKey);
  const item=payload?.item||payload?.cast;
  const versionOk=payload?.v===1||payload?.v===2;
  if(!payload||!versionOk||!ALLOWED_ITEMS.has(item)||payload.buyerKeyHash!==expectedBuyerHash)return json(res,403,{ok:false,error:'invalid_entitlement'});
  return json(res,200,{ok:true,item,cast:(item==='daisy'||item==='mick')?item:undefined});
};
