export type AnalyticsOrder={id:string;outlet:string;created:number;status:string;total:number;items:any};
const offset=330*60000,day=86400000;
export const campusDay=(time:number)=>new Date(time+offset).toISOString().slice(0,10);
export const periods={'today':1,'7':7,'15':15,'30':30,'all':0} as const;
export function retailerAnalytics(records:AnalyticsOrder[],outlet:string,period:string='today',now=Date.now()){
 if(!(period in periods))throw Error('Choose a valid reporting period.');
 const today=campusDay(now),end=Date.parse(today+'T00:00:00Z')-offset+day;
 const own=records.filter(o=>o.outlet===outlet&&o.created<=now);
 const days=periods[period as keyof typeof periods];const start=days?end-days*day:own.length?Date.parse(campusDay(own.reduce((earliest,o)=>Math.min(earliest,o.created),now))+'T00:00:00Z')-offset:end-day;
 const orders=own.filter(o=>o.created>=start&&o.created<end).sort((a,b)=>b.created-a.created);
 const completed=orders.filter(o=>o.status==='Collected');const completedValue=completed.reduce((n,o)=>n+Number(o.total),0);
 const daily=[];for(let at=start;at<end;at+=day){const key=campusDay(at),rows=orders.filter(o=>campusDay(o.created)===key);daily.push({date:key,orders:rows.length,sales:rows.filter(o=>o.status==='Collected').reduce((n,o)=>n+Number(o.total),0)});}
 return {period,timeZone:'Asia/Kolkata',range:{start:campusDay(start),end:today},basis:'Orders placed in this date range, grouped by their current status. Sales means collected-order value; payment collection is not recorded.',totals:{placed:orders.length,completed:completed.length,pending:orders.filter(o=>['Pending','Confirmed','Accepted','Preparing','Ready'].includes(o.status)).length,cancelled:orders.filter(o=>o.status==='Cancelled').length,rejected:orders.filter(o=>o.status==='Denied').length,orderValue:orders.reduce((n,o)=>n+Number(o.total),0),completedValue,received:null,averageCompletedValue:completed.length?completedValue/completed.length:0},daily,transactions:orders.map(o=>({id:o.id,date:o.created,items:typeof o.items==='string'?JSON.parse(o.items):o.items,status:o.status,amount:o.total,paymentStatus:'Not recorded'}))};
}
