const crypto=require('crypto');
const ALLOWED_ITEMS=new Set(['daisy','mick','cyberpunk','goldonly','synthwave','ragepass']);
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json');res.end(JSON.stringify(body));}
function b64url(input){return Buffer.from(input).toString('base64url');}
function hashBuyerKey(value){return crypto.createHash('sha256').update(String(value)).digest('hex');}
function entitlementSecret(){const source=process.env.ENTITLEMENT_SECRET||process.env.STRIPE_SECRET_KEY;return crypto.createHmac('sha256',source).update('n99-entitlements-v1').digest();}
function signEntitlement(payload,secret){const encoded=b64url(JSON.stringify(payload));const signature=crypto.createHmac('sha256',secret).update(encoded).digest('base64url');return `${encoded}.${signature}`;}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  if(!process.env.STRIPE_SECRET_KEY)return json(res,503,{error:'payments_not_configured'});
  const {session_id:sessionId,buyerKey}=req.body||{};
  if(typeof sessionId!=='string'||!sessionId.startsWith('cs_')||typeof buyerKey!=='string'||buyerKey.length<20||buyerKey.length>200)return json(res,400,{error:'invalid_request'});
  try{
    const stripeRes=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`}});
    const session=await stripeRes.json(); if(!stripeRes.ok)return json(res,400,{error:'invalid_session'});
    const item=session?.metadata?.item||session?.metadata?.cast;
    const expectedBuyerHash=hashBuyerKey(buyerKey);
    const paid=session?.payment_status==='paid'&&session?.status==='complete';
    const buyerMatches=session?.metadata?.buyerKeyHash===expectedBuyerHash;
    if(!paid||!buyerMatches||!ALLOWED_ITEMS.has(item))return json(res,403,{error:'purchase_not_verified'});
    const payload={v:2,item,buyerKeyHash:expectedBuyerHash,purchase:session.id,iat:Math.floor(Date.now()/1000)};
    const token=signEntitlement(payload,entitlementSecret());
    return json(res,200,{ok:true,item,cast:(item==='daisy'||item==='mick')?item:undefined,token});
  }catch(err){console.error('[N99 PAYMENTS] verify purchase error',err?.message||err);return json(res,502,{error:'verification_unavailable'});}
};
