import {createGmailSender} from './gmail.mjs';

export function mailRuntime(source){
 const values=Object.fromEntries(['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_OAUTH_REFRESH_TOKEN','EMAIL_FROM'].map(key=>[key,String(source[key]||'').trim()]));
 const configured=Object.values(values).every(Boolean);
 return {...values,sendEmail:configured?createGmailSender({clientId:values.GOOGLE_CLIENT_ID,clientSecret:values.GOOGLE_CLIENT_SECRET,refreshToken:values.GOOGLE_OAUTH_REFRESH_TOKEN}):null};
}
