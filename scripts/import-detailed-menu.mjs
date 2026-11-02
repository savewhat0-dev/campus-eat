import fs from 'node:fs';
import crypto from 'node:crypto';
import {menu as old} from '../lib/catalog-legacy.ts';
const source=fs.readFileSync(process.argv[2]||'docs/Campus_Eats_Detailed_Menu.md','utf8');
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
let outlet='',category='',result=[];const used=new Set();
for(const line of source.split(/\r?\n/)){
 if(line.startsWith('## ')){const t=line.slice(3);outlet=t.startsWith('GreeNox')?'greenox':t==='Maggi Point'?'maggi':t==='Burger Singh'?'burger':t==='Café Coffee Day Xpress'?'cafe':t==='Domino’s Pizza'?'dominos':'';category='';}
 if(line.startsWith('### '))category=line.slice(4);
 if(!outlet||!line.startsWith('| ')||category.includes('Visible price conflicts'))continue;
 const cells=line.split('|').slice(1,-1).map(x=>x.trim());if(cells.length!==3||cells[0]==='Product'||cells[0].startsWith('---'))continue;
 const [raw,prices,details]=cells;const isDom=outlet==='dominos';
 let name=raw.replace(/ — Board [AB]$/,'');
 let options=prices.split('/').map(x=>{const m=x.match(/\d+/);return m?Number(m[0]):null;});
 const sizes=outlet==='cafe'&&category==='Hot beverages'?['Small','Large']:isDom&&category.includes('Sourdough')?['Regular','SLIM']:['Regular','Medium','Large'];
 let flavours=[name];
 if(outlet==='cafe'&&name.includes(' — ')){const [base,fl]=name.split(' — ');flavours=fl.split(' / ').map(f=>base+' — '+f);}
 if(outlet==='cafe'&&name==='Garam Chai / Green Tea / Lemon Tea')flavours=name.split(' / ');
 for(const flavour of flavours)for(let i=0;i<options.length;i++){
 const missing=options[i]===null;if(missing&&prices!=='Not legible')continue;
 let variant=options.length>1?sizes[i]:outlet==='cafe'?(/Only large|large column/.test(details)?'Large':/Only small/.test(details)?'Small':''):'';
 let productName=flavour;
 if(isDom&&!category.includes('Classic')&&!category.includes('Crusts'))productName=category.replace(/ — Board [AB]/,'').replace(/ pizzas?/i,'')+' · '+flavour;
 const conflict=isDom&&(/Classic non-vegetarian|Crusts/.test(category)||['Achari Do Pyaza','Peppy Paneer'].includes(name)&&category.includes('Classic vegetarian')||name==='Margherita'&&i===2);
 const review=missing||conflict;
 const prev=old.find(p=>!used.has(p.id)&&p.outlet===outlet&&norm(p.name)===norm(productName)&&norm(p.variant||'')===norm(variant));
 const id=prev?.id||'md-'+crypto.createHash('sha256').update([outlet,category,productName,variant].join('|')).digest('hex').slice(0,16);used.add(id);
 const dietKnown=/vegetarian salads|Classic vegetarian|Vegetarian burgers|Chicken salads|Chicken and mutton|Classic non-vegetarian/i.test(category)||outlet==='maggi'&&/Vegetarian|Non-vegetarian|Contains egg/.test(details)||/\[Veg\]|\(Veg\)/.test(name);
 const veg=dietKnown&&!/Non-vegetarian|Contains egg/.test(details)&&!/Chicken salads|Chicken and mutton|Classic non-vegetarian/i.test(category);
 result.push({id,outlet,name:productName,category:category.replace(/ — Board [AB]/,''),price:review?null:options[i],variant,description:outlet==='greenox'&&details!=='Description not supplied'?details:'',veg,dietaryKnown:dietKnown,available:!review,image:prev?.image||outlet,illustrationApproved:!!prev,sourceRevision:'2026-11-02',sourcePrice:prices,sourceNotes:details,priceReview:review,sourceCategory:category});
 }
}
result=result.filter((p,i,a)=>a.findIndex(q=>q.id===p.id)===i);
fs.writeFileSync('lib/menu-import.ts','// Transcribed from the supplied Campus_Eats_Detailed_Menu.md; do not guess unresolved prices.\nexport const importedMenu='+JSON.stringify(result,null,2)+';\n');
fs.writeFileSync('MENU-REVIEW.json',JSON.stringify({revision:'2026-11-02',options:result.length,byOutlet:Object.fromEntries([...new Set(result.map(p=>p.outlet))].map(o=>[o,result.filter(p=>p.outlet===o).length])),priceReview:result.filter(p=>p.priceReview),missingImages:result.filter(p=>!p.illustrationApproved).map(p=>({id:p.id,outlet:p.outlet,name:p.name,variant:p.variant})),conflictingBoards:source.slice(source.indexOf('### Visible price conflicts'),source.indexOf('## Product image requirements'))},null,2));
console.log('Imported',result.length,'options;',result.filter(p=>p.priceReview).length,'price reviews');
