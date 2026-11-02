import fs from 'node:fs';let s=fs.readFileSync('lib/api.ts','utf8');s=s.replace("  const all=await allSettings();const store=all[outlet];",`  const selectedProducts=entries.map(([id])=>menu.find(m=>m.id===id)!);
  if(selectedProducts.some(p=>p.outlet==='burger'&&p.category==='Meal upgrades')&&!selectedProducts.some(p=>p.outlet==='burger'&&/burgers/i.test(p.category)))return json({error:'Choose a burger before adding a meal upgrade.'},400);
  if(selectedProducts.some(p=>p.outlet==='greenox'&&p.category==='Burrito bowl add-ons')&&!selectedProducts.some(p=>p.outlet==='greenox'&&p.category==='Burrito bowls'))return json({error:'Choose a burrito bowl before adding its extras.'},400);
  const all=await allSettings();const store=all[outlet];`);fs.writeFileSync('lib/api.ts',s);
