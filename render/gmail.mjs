let cachedAccessToken='';
let accessTokenExpiresAt=0;
let tokenRequest=null;

function failure(code,responseCode){
 const error=new Error(code);
 error.code=code;
 if(Number.isInteger(responseCode))error.responseCode=responseCode;
 return error;
}

async function accessToken({clientId,clientSecret,refreshToken}){
 if(cachedAccessToken&&Date.now()<accessTokenExpiresAt-60000)return cachedAccessToken;
 if(tokenRequest)return tokenRequest;
 tokenRequest=(async()=>{
  const body=new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:'refresh_token'});
  let response;
  try{response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(15000)});}
  catch{throw failure('google_oauth_network_error');}
  if(!response.ok)throw failure('google_oauth_rejected',response.status);
  const payload=await response.json().catch(()=>null);
  if(typeof payload?.access_token!=='string'||!Number.isFinite(payload?.expires_in))throw failure('google_oauth_invalid_response');
  cachedAccessToken=payload.access_token;
  accessTokenExpiresAt=Date.now()+payload.expires_in*1000;
  return cachedAccessToken;
 })();
 try{return await tokenRequest;}finally{tokenRequest=null;}
}

function mimeMessage({from,to,subject,text,html}){
 if(/[\r\n]/.test(from)||/[\r\n]/.test(to)||/[\r\n]/.test(subject))throw failure('gmail_invalid_header');
 const encoded=value=>Buffer.from(String(value),'utf8').toString('base64').replace(/.{1,76}/g,'$&\r\n').trimEnd();
 const boundary=`campus-eats-${crypto.randomUUID()}`;
 const lines=[
  `From: ${from}`,`To: ${to}`,`Subject: ${subject}`,'MIME-Version: 1.0',
  `Content-Type: multipart/alternative; boundary="${boundary}"`,'',
  `--${boundary}`,'Content-Type: text/plain; charset="UTF-8"','Content-Transfer-Encoding: base64','',
  encoded(text),
  `--${boundary}`,'Content-Type: text/html; charset="UTF-8"','Content-Transfer-Encoding: base64','',
  encoded(html),`--${boundary}--`,''
 ];
 return Buffer.from(lines.join('\r\n'),'utf8').toString('base64url');
}

export function createGmailSender(config){
 const {clientId,clientSecret,refreshToken}=config;
 return async message=>{
  const token=await accessToken({clientId,clientSecret,refreshToken});
  const raw=mimeMessage(message);
  let response;
  try{response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw}),signal:AbortSignal.timeout(20000)});}
  catch{throw failure('gmail_api_network_error');}
  if(!response.ok){
   if(response.status===401){cachedAccessToken='';accessTokenExpiresAt=0;}
   throw failure('gmail_api_rejected',response.status);
  }
  const result=await response.json().catch(()=>null);
  if(typeof result?.id!=='string')throw failure('gmail_api_invalid_response');
  return result;
 };
}
