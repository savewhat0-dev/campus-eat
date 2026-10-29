import { menu,outlets, type Item } from './catalog';
export type OutletState={open?:boolean;unavailable?:string[];hours?:string};
export type FoodAnswer={kind:'results'|'not-found';text:string;items:Item[];outletIds:string[];total:number;timingNote:string};
export type FoodContext={query?:string};
const normal=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{M}\p{N}₹\s-]/gu,' ').replace(/\s+/g,' ').trim();
const groups:[RegExp,string[]][]=[
 [/\b(pizza|pizzas|piza|pizaa)\b|पिज़्ज़ा|पिज्जा/,['pizza']],
 [/\b(burger|burgers|burgur)\b|बर्गर/,['burger']],
 [/\b(fries|french fry|french fries|fryes)\b|फ्राइज|फ्राइज़/,['fries']],
 [/\b(rolls?|wraps?)\b|रोल|रैप/,['roll','wrap']],
 [/\b(coffee|cappuccino|latte|espresso|frappe)\b|कॉफी|काफी/,['coffee','cappuccino','latte','espresso','frappe','mocha']],
 [/\b(chai|tea)\b|चाय/,['chai','tea']],
 [/\b(maggi|noodles?)\b|मैगी|नूडल/,['maggi']],
 [/\b(salads?)\b|सलाद/,['salad']],
 [/\b(sandwich|sandwiches|subs?)\b|सैंडविच/,['sandwich','sub']],
 [/\b(momos?|dumplings?)\b|मोमोज|मोमो/,['momo']],
 [/\b(pasta|pazzta)\b|पास्ता/,['pasta','pazzta']],
 [/\b(rice|bowls?|burrito)\b|चावल|बाउल/,['rice','bowl','burrito']],
 [/\b(ice cream|icecream|desserts?)\b|आइसक्रीम/,['ice cream','vanilla','strawberry','chocolate','butter scotch','mango']],
 [/\b(drinks?|beverages?|milkshakes?)\b|पेय|शेक/,['beverages','milkshake','coffee','tea','chai','frappe']],
 [/\b(breads?|naan|roti|parathas?)\b|नान|रोटी|पराठा/,['breads','naan','roti','paratha']],
 [/\b(soups?)\b|सूप/,['soup']],
 [/\b(tacos?)\b|टाको/,['taco']],
];
const missingFood=/\b(sushi|ramen|dosa|idli|biryani|samosa|pani puri|chole bhature|jalebi|waffles?|pancakes?|lasagna|lasagne|falafel platter|shawarma|steak tartare|lobster|dragonfruit|donuts?|doughnuts?)\b|डोसा|इडली|बिरयानी|समोसा|सुशी/;
const followup=/^(?:and |aur |और )?(?:under|below|within|cheaper|cheapest|veg only|only veg|non veg|nonveg|without chicken|under ₹?\d|in \d|within \d|₹|\d)/;
export function findCampusFood(message:string,states:Record<string,OutletState>={},context:FoodContext={}):FoodAnswer{
 let q=normal(message.replace(/पनीर/g,'paneer').replace(/चिकन/g,'chicken').replace(/बर्गर/g,'burger').replace(/फ्राइज|फ्राइज़/g,'fries').replace(/पिज्जा|पिज़्ज़ा/g,'pizza').replace(/कॉफी/g,'coffee'));const timingNote='Preparation times are estimates from the reference menu, not live queue times. Opening hours need outlet confirmation.';const askProduct:FoodAnswer={kind:'not-found',text:'Please specify the particular product name.',items:[],outletIds:[],total:0,timingNote};if(!q||q.length>400)return askProduct;
 const previous=context.query?normal(context.query):'';const isFollowup=!!previous&&followup.test(q);
 if(isFollowup)q=previous+' '+q;
 const groupMatches=groups.filter(([re])=>re.test(q));
 const outletMatches=outlets.filter(o=>normal(o.name).split(' ').some(t=>t.length>3&&q.split(' ').includes(t))||(o.id==='dominos'&&/domino/.test(q))||(o.id==='greenox'&&/greenox|green ops|green nox/.test(q))||(o.id==='cafe'&&/\bccd\b/.test(q)));
 const unknownFood=missingFood.test(q);
 const named=menu.filter(m=>!['french fries','tea','cappuccino'].includes(normal(m.name))&&q.includes(normal(m.name))).map(m=>m.id);
 const ingredient=/\b(paneer|chicken|cheese|mutton|mushroom|aloo|potato|corn|egg)\b|पनीर|चिकन/.test(q);
  if(!groupMatches.length&&!unknownFood&&!named.length&&!ingredient)return askProduct;
 // Match only menu products/categories; outlet names alone never count as a product request.
 
  if(unknownFood&&!groupMatches.length&&!named.length&&!ingredient)return {kind:'not-found',text:'That product is not listed in the campus menus.',items:[],outletIds:[],total:0,timingNote};
 const priceQuery=q.replace(/(?:within|in|under|less than)\s*\d+\s*(?:minutes?|mins?|मिनट)/g,'');
 const budgetMatches=[...priceQuery.matchAll(/(?:under|below|within|budget(?: of)?|less than|max(?:imum)?|up to)\s*(?:rs\s*|₹\s*)?(\d+)/g)];
 const hindiBudget=q.match(/(\d+)\s*(?:रुपये|रुपए|rupaye|rupees|rs)?\s*(?:से कम|तक|tak|se kam)/);
 const cap=budgetMatches.length?Math.min(...budgetMatches.map(m=>Number(m[1]))):hindiBudget?Number(hindiBudget[1]):Infinity;
 const timeMatches=[...q.matchAll(/(?:within|in|under|less than)\s*(\d+)\s*(?:minutes?|mins?|मिनट)/g)];const limit=timeMatches.length?Math.min(...timeMatches.map(m=>Number(m[1]))):Infinity;
 const nonVeg=/\b(non[ -]veg(?:etarian)?|nonveg|chicken|mutton|egg)\b|मांसाहारी|चिकन/.test(q)&&!/without chicken|no chicken/.test(q);
 const veg=!nonVeg&&/\b(veg|vegetarian|without chicken|no chicken)\b|शाकाहारी/.test(q);
 const searchTerms=groupMatches.flatMap(([,terms])=>terms);
 const ingredients=[...q.matchAll(/\b(paneer|chicken|mutton|mushroom|aloo|corn|egg)\b/g)].map(m=>m[1]);
 let found=menu.filter(m=>{
  const text=normal(m.name+' '+m.category);if(states[m.outlet]?.open===false||states[m.outlet]?.unavailable?.includes(m.id))return false;
  if(outletMatches.length&&!outletMatches.some(o=>o.id===m.outlet))return false;
  if(m.price>cap||veg&&!m.veg||nonVeg&&m.veg)return false;
  const max=Number(outlets.find(o=>o.id===m.outlet)!.time.match(/\d+/g)!.at(-1));if(max>limit)return false;
  if(named.length)return named.includes(m.id);
  if(searchTerms.length&&!searchTerms.some(t=>normal(m.name).includes(t)||(t==='pizza'&&normal(m.category).includes('pizza'))||(t==='burger'&&(/burgers|chicken mutton/.test(normal(m.category))))||(t==='beverages'&&normal(m.category).includes('beverages'))))return false;
  if(groupMatches.length===1&&/ice cream|icecream|आइसक्रीम/.test(q)&&m.category!=='Ice cream')return false;
  if(ingredients.length&&!ingredients.some(t=>text.includes(t)))return false;
  return true;
 });
 found.sort((a,b)=>a.price-b.price||a.name.localeCompare(b.name));
 const total=found.length;const outletIds=[...new Set(found.map(m=>m.outlet))];
 // Include every matching outlet before filling the remaining result slots.
 const first=outletIds.map(id=>found.find(m=>m.outlet===id)!);const items=[...first,...found.filter(m=>!first.some(i=>i.id===m.id))].slice(0,8);
 if(!items.length)return {kind:'not-found',text:'इन preferences के लिए अभी कोई available campus-menu match नहीं मिला। Try another food, budget or preparation time.',items:[],outletIds:[],total:0,timingNote};
 const hours=/\b(open|opening|hours|closed|close|today|now|tomorrow)\b/.test(q);
 return {kind:'results',text:hours?'These menu items are listed. Opening hours are not verified, so please confirm with the outlet.':`Here are ${total} matching menu item${total===1?'':'s'}.`,items,outletIds,total,timingNote};
}


