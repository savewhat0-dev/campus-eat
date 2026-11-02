import fs from 'node:fs';
const edit=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));
edit('components/product-card.tsx',s=>s.replace("{current.veg?'Vegetarian':'Non-vegetarian'}</span><h2 id=", "{current.veg?'Vegetarian':'Non-vegetarian'}</span></>}<h2 id="));
edit('lib/catalog-store.ts',s=>s.replace('return {id,outlet,name,category,description,price,variant,veg:input.veg,','return {sourceRevision:menu.find(p=>p.id===id)?.sourceRevision,illustrationApproved:input.illustrationApproved===true,dietaryKnown:input.dietaryKnown!==false,priceReview:false,id,outlet,name,category,description,price,variant,veg:input.veg,'));
edit('lib/api.ts',s=>s.replace('accounts.length===5','accounts.length>=5&&accounts.length<=6').replace(')).size===5',')).size===accounts.length').replace('ids.every(id=>','accounts.every((a:any)=>outlets.some(o=>o.id===a.outlet))&&ids.every(id=>'));
edit('lib/wash-chat.ts',s=>s.replace('veg&&!m.veg||nonVeg&&m.veg','veg&&(!m.veg||m.dietaryKnown===false)||nonVeg&&(m.veg||m.dietaryKnown===false)'));
edit('components/retailer-dashboard.tsx',s=>s.replace('value={editing.price}','value={editing.price??\'\'}'));
