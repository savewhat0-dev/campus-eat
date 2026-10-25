export const orderStages=['Pending','Accepted','Preparing','Ready','Collected'];
export const isPastOrder=(status:string)=>['Collected','Cancelled','Denied'].includes(status);
export function validUniversityEmail(value:string){return value.length<=254&&/^[a-z0-9]+(?:[._%+\-][a-z0-9]+)*@bmu\.edu\.in$/i.test(value);}
export type CustomerDetails={name:string;enrollment:string;phone:string;email?:string};
export function validateCustomerDetails(input:any):CustomerDetails{
 const name=String(input?.name||'').trim();const enrollment=String(input?.enrollment||'').trim();const phone=String(input?.phone||'').replace(/[\s()-]/g,'');
 if(name.length<2||name.length>100)throw Error('Enter your full name (2–100 characters).');
 if(!/^[a-z0-9][a-z0-9 /-]{2,39}$/i.test(enrollment))throw Error('Enter your enrollment number or faculty ID.');
 if(!/^(?:\+91)?[6-9]\d{9}$/.test(phone))throw Error('Enter a valid 10-digit Indian mobile number.');
 return {name,enrollment,phone};
}
export function nextOrderStatus(role:string,current:string,requested:string){
 if(role==='customer')return requested==='Cancelled'&&['Pending','Confirmed'].includes(current)?requested:null;
 if(role!=='retailer')return null;
 const allowed:Record<string,string[]>={Pending:['Accepted','Denied'],Confirmed:['Accepted','Denied'],Accepted:['Preparing'],Preparing:['Ready'],Ready:['Collected']};
 return allowed[current]?.includes(requested)?requested:null;
}
