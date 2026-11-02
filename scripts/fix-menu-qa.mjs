import fs from 'node:fs';
const edit=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));
edit('lib/wash-chat.ts',s=>s.replace("Number(outlets.find(o=>o.id===m.outlet)!.time.match(/\\d+/g)!.at(-1))","Number(outlets.find(o=>o.id===m.outlet)?.time.match(/\\d+/g)?.at(-1)||Infinity)"));
edit('lib/api.ts',s=>s.replace('a.outlet)).size===5','a.outlet)).size===accounts.length'));
edit('app/page.tsx',s=>s.replace("const source=kind==='hero'?","const source=kind==='maggi'?'/assets/illustrations/paneer-roll.webp':kind==='hero'?").replace("srcSet={kind!=='hero'?","srcSet={kind!=='hero'&&kind!=='maggi'?").replace('Campus Eats brings five BMU outlets','Campus Eats brings BMU outlets'));
