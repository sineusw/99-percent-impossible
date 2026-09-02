const crypto = require('crypto');

const PRICE_IDS = {
  daisy: 'price_1UApShBur33eQsaGzanfLYQ3',
  mick: 'price_1UApXpBur33eQsaGwxjdY52j',
  cyberpunk: 'price_1UAqzABur33eQsaGH2Bg4bo2',
  goldonly: 'price_1UAr3GBur33eQsaGfK05zMBM',
  synthwave: 'price_1UAr4jBur33eQsaGqyoQW3D9',
  ragepass: 'price_1UAr65Bur33eQsaGNTCktFI3'
};

function json(res,status,body){res.status(status).setHeader('Content-Type','application/json');res.end(JSON.stringify(body));}
function hashBuyerKey(value){return crypto.createHash('sha256').update(String(value)).digest('hex');}
function getOrigin(req){
  if(process.env.APP_ORIGIN)return process.env.APP_ORIGIN.replace(/\/$/,'');
  const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
  return host?`${proto}://${host}`:null;
}

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  if(!process.env.STRIPE_SECRET_KEY)return json(res,503,{error:'payments_not_configured'});
  const {item,cast,buyerKey}=req.body||{};
  const product=String(item||cast||'');
  const price=PRICE_IDS[product];
  if(!price||typeof buyerKey!=='string'||buyerKey.length<20||buyerKey.length>200)return json(res,400,{error:'invalid_request'});
  const origin=getOrigin(req); if(!origin)return json(res,500,{error:'origin_unavailable'});
  const buyerKeyHash=hashBuyerKey(buyerKey);
  const params=new URLSearchParams();
  params.set('mode','payment');
  params.set('line_items[0][price]',price);
  params.set('line_items[0][quantity]','1');
  params.set('metadata[item]',product);
  params.set('metadata[buyerKeyHash]',buyerKeyHash);
  params.set('payment_intent_data[metadata][item]',product);
  params.set('payment_intent_data[metadata][buyerKeyHash]',buyerKeyHash);
  params.set('success_url',`${origin}/?purchase=success&item=${encodeURIComponent(product)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url',`${origin}/?purchase=cancelled`);
  params.set('allow_promotion_codes','false');
  try{
    const stripeRes=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:params.toString()});
    const data=await stripeRes.json();
    if(!stripeRes.ok||!data.url||!data.id){console.error('[N99 PAYMENTS] Stripe checkout create failed',stripeRes.status,data?.error?.type||'unknown');return json(res,502,{error:'checkout_create_failed'});}
    return json(res,200,{id:data.id,url:data.url});
  }catch(err){console.error('[N99 PAYMENTS] checkout error',err?.message||err);return json(res,502,{error:'checkout_unavailable'});}
};
