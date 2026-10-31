import {menu} from '../lib/catalog.ts';
import {rankProducts} from '../lib/product-search.ts';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['lib/wash-chat.ts'],bundle:true,platform:'node',format:'esm',outfile:'outputs/chef-upgrade-test.mjs'});
const {findCampusFood:ask}=await import('../outputs/chef-upgrade-test.mjs');
for(const [q,expected]of [['I want Margherita Pizza.','Margherita'],['Show me Paneer Roll.','Paneer Roll'],['I want cold coffee.','Cold Coffee']]){const r=ask(q);assert.equal(r.kind,'results',q);assert.ok(r.items.length);assert.ok(r.items.every(p=>p.name===expected),q);}
let r=ask('Suggest something under ₹100.');assert.ok(r.items.length);assert.ok(r.items.every(p=>p.price<=100));
r=ask('Which vegetarian pizzas are available?');assert.ok(r.items.length);assert.ok(r.items.every(p=>p.veg&&p.category==='Veg pizza'));
r=ask('Show me Burger Singh burgers.');assert.ok(r.items.length);assert.ok(r.items.every(p=>p.outlet==='burger'));
r=ask('Is Margherita Pizza available?');assert.ok(r.items.every(p=>p.name==='Margherita'));
r=ask('What is the price of this pizza?',{}, {query:'Margherita'});assert.ok(r.items.length);assert.ok(r.items.every(p=>p.name==='Margherita'));
r=ask('Is Margherita Pizza available?',{dominos:{open:false}});assert.match(r.text,/unavailable/);assert.ok(r.items.every(p=>p.name==='Margherita'));
assert.equal(ask('What is calculus?').text,'Please specify the particular product name.');
assert.equal(ask('sushi').items.length,0);
assert.equal(ask('vegan pizza').items.length,0);
assert.equal(ask('gluten free pizza').items.length,0);
r=ask('मुझे पनीर रोल चाहिए');assert.ok(r.items.length);assert.ok(r.items.every(p=>/paneer/i.test(p.name)));
console.log('PASS: all eight requested Chef questions, specific-product priority, budget, diet, context, Hindi, unavailable products, unknown food and unrecorded allergen certifications.');

for(const query of ['chiken sandwch','sandwich chicken','barbecue chicken sandwich']){const matches=rankProducts(query,menu);assert.ok(matches.some(r=>r.item.name==='Grilled Chicken BBQ Sandwich'));}

for(const q of ['Hi','Hello','Hey!']){const greeting=ask(q);assert.equal(greeting.kind,'conversation');assert.equal(greeting.items.length,0);assert.match(greeting.text,/what would you like to eat/i);}
const hungry=ask('I want something to eat');assert.equal(hungry.kind,'conversation');assert.equal(hungry.items.length,0);assert.match(hungry.text,/snack.*meal/i);
assert.ok(ask('snacks',{}, {query:hungry.context}).items.length);assert.ok(ask('vegetarian',{}, {query:'pizza'}).items.every(p=>p.veg&&p.category==='Veg pizza'));
assert.ok(ask('paneer rol').items.every(p=>/paneer/i.test(p.name)&&/roll/i.test(p.name)));
