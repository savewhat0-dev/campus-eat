export function publicOrigin(env=process.env){
 const value=env.PUBLIC_ORIGIN?.trim()||env.RENDER_EXTERNAL_URL?.trim()||(!env.RENDER?`http://localhost:${env.PORT||3000}`:'');
 if(!value)throw Error('Render public URL is missing; set PUBLIC_ORIGIN');
 let url;try{url=new URL(value);}catch{throw Error('PUBLIC_ORIGIN must be a valid HTTP(S) origin');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('PUBLIC_ORIGIN must contain only scheme and hostname, with no path or credentials');
 if(env.RENDER&&url.protocol!=='https:')throw Error('PUBLIC_ORIGIN must use HTTPS on Render');
 return url.origin;
}
