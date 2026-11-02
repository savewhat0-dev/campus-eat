import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {menu} from '../lib/catalog.ts';

// Crop only the food photograph from each supplied contact-sheet tile. Captions,
// outlet names, tile numbers, and grid rules are deliberately kept outside crops.
const D = process.env.USERPROFILE + '/Downloads/';
const sheets = [
  ['Campus Eats ten-product contact sheet-13.png', '5x2', [
    ['cafe','Soup — Vegetable Corn'],['cafe','Cold Coffee — Classic'],['cafe','Cold Coffee — Hazelnut'],['cafe','Cold Coffee — Caramel'],['cafe','Milkshake — Classic Chocolate'],['cafe','Milkshake — Berry'],['burger','Small Fries'],['burger','Large Fries'],['burger','Onion Rings (6 pcs)'],['burger','Cheesy Coins (3 pcs)']]],
  ['Burger Singh campus eats lineup-12.png', '5x2', [
    ...['Pink Guava','Blueberry','Mango','Blackcurrant','Mint'].map(x=>['burger',`Fruit Iced Tea — ${x}`]),['burger','Gulaabo Pink Lemonade'],['burger','Shake'],['burger','Fauji-Mess Custard Pocket (1 pc)'],['burger','Fauji-Mess Custard Pocket (2 pcs)'],['burger','Fruit Iced Tea + Fries upgrade']]],
  ['GreeNox campus drinks_ ten-tile contact sheet-3.png', '5x2', [
    ['greenox','Cookies Caramel Shake'],['greenox','Matcha Blueberry Shake'],['greenox','Classic Cold Coffee'],['greenox','Hazelnut Cold Coffee'],['greenox','Iced Americano'],['greenox','Iced Matcha Latte'],['greenox','Iced Caramel Latte'],['greenox','Orange Juice'],['greenox','Watermelon Juice'],['greenox','The Vitamin C Juice']]],
  ['Pink rose lemonade and fries-22.png', '5x2', [
    ['burger','Gulaabo + Fries upgrade'],['dominos','Corn & Cheese Paratha Pizza'],['dominos','Cheese & Corn'],['dominos','Cheese Overload'],['dominos','Pizza Mania · Classic'],['dominos','Pizza Mania · Onion'],['dominos','Pizza Mania · Golden Corn'],['dominos','Pizza Mania · Capsicum & Red Paprika'],['dominos','Pizza Mania · Capsicum & Masala Paneer'],['dominos','Pizza Mania · Paneer, Onion & Capsicum']]],
  ['Fries trio_ French, peri peri, chilli garlic-21.png', '3x1', [
    ['maggi','French Fries'],['maggi','Peri Peri Fries'],['maggi','Chilli Garlic Fries']]],
  ['Campus Eats_ Ten Delicious Menu Picks-20.png', '5x2', [
    ['dominos','Fresh Pan crust'],['dominos','100% Wheat Thin Crust'],['dominos','Cheese Burst'],['dominos','Garlic Bread meal add-on'],['dominos','Choco Lava Cake + Pepsi'],['maggi','Maggi Wrap'],['maggi','Paneer Wrap'],['maggi','Egg Wrap'],['maggi','Chicken Wrap'],['maggi','Chicken Tikka Wrap']]],
  ['Campus Eats wraps, burgers, and bites-19.png', '5x2wide', [
    ['maggi','Malai Chicken Tikka Wrap'],['maggi','Veg Grilled Sandwich'],['maggi','Cheese Grilled Sandwich'],['maggi','Paneer Grilled Sandwich'],['maggi','Chicken Grilled Sandwich'],['maggi','Veg Burger'],['maggi','Chicken Burger'],['maggi','Veg Nuggets (6 pcs)'],['maggi','Chicken Nuggets (6 pcs)'],['maggi','Cheese Shorts (6 pcs)']]],
  ['Domino’s ten-pizza campus menu-18.png', '5x2', [
    ['dominos','Sourdough · Creamy Truffle Mushroom'],['dominos','Sourdough · Chicken Pepperoni'],['dominos','Sourdough · Classic Truffle Pepperoni'],['dominos','Sourdough · Pesto Chicken'],['dominos','Sourdough · Creamy Truffle Chicken'],['dominos','Chicken Burst · Chicken Burst Tandoori'],['dominos','Chicken Burst · Chicken Burst Southern Spice'],['dominos','Chicken Burst · Chicken Burst Korean'],['dominos','Chicken Burst · Chicken Burst Shawarma'],['dominos','Big Big · Big Big Pizza — Veg']]],
  ['Big Big Pizza cheeseburst variety sheet-17.png', '5x2wide', [
    ['dominos','Big Big · Big Big Pizza — Chicken'],['dominos','Big Big · Cheese Burst — Veg'],['dominos','Big Big · Big Big Pizza Cheezilla — Veg'],['dominos','Big Big · Cheese Burst — Chicken'],['dominos','Big Big · Lava Burst — Veg'],['dominos','Big Big · Tandoori Cheese Burst — Veg'],['dominos','Big Big · Korean Sweet Chilli Cheeseburst — Veg'],['dominos','Big Big · Lava Burst — Chicken'],['dominos','Big Big · Tandoori Cheese Burst — Chicken'],['dominos','Big Big · Korean Sweet Chilli Cheeseburst — Chicken']]],
  ['Domino’s ten-pizza contact sheet-16.png', '5x2wide', [
    ['dominos','Cheese Volcano · Peppy Paneer'],['dominos','Cheese Volcano · Cheese N Corn'],['dominos','Cheese Volcano · Veggie Paradise'],['dominos','Cheese Volcano · Pepper BBQ Chicken'],['dominos','Cheese Volcano · Spiced Double Chicken'],['dominos','Cheese Volcano · Chicken Golden Delight'],['dominos','Cheese Volcano · Blazing Chicken & Paprika'],['dominos','Sourdough · Classic Veg'],['dominos','Sourdough · Classic Truffle'],['dominos','Sourdough · Pesto Veggie']]],
  ['Domino’s pizza and cheese sampler-15.png', '5x2', [
    ['dominos','Pizza Mania · Veg Loaded'],['dominos','Cheese Lava Pull Apart · Golden Corn'],['dominos','Cheese Lava Pull Apart · Peppy Paneer'],['dominos','Cheese Lava Pull Apart · Farmhouse'],['dominos','Cheese Lava Pull Apart · Veggie Paradise'],['dominos','Cheese Lava Pull Apart · Pepper BBQ Chicken'],['dominos','Cheese Lava Pull Apart · Spiced Double Chicken'],['dominos','Cheese Lava Pull Apart · Chicken Golden Delight'],['dominos','Cheese Lava Pull Apart · Blazing Chicken & Paprika'],['dominos','Cheese Volcano · Farmhouse']]],
  ['Campus Eats_ Cheesy pizza and fries-14.png', '5x2', [
    ['burger','Gulaabo + Fries upgrade'],['dominos','Corn & Cheese Paratha Pizza'],['dominos','Cheese & Corn'],['dominos','Cheese Overload'],['dominos','Pizza Mania · Classic'],['dominos','Pizza Mania · Onion'],['dominos','Pizza Mania · Golden Corn'],['dominos','Pizza Mania · Capsicum & Red Paprika'],['dominos','Pizza Mania · Capsicum & Masala Paneer'],['dominos','Pizza Mania · Paneer, Onion & Capsicum']]],
  ['Burger Singh momo, dips, and iced teas-11.png', '5x2', [
    ['burger','Kurkure Veg Momo (5 pcs)'],['burger','Kurkure Paneer Momo (5 pcs)'],['burger','Kurkure Chicken Momo (5 pcs)'],['burger','Kurkure Chicken Cheese Momo (5 pcs)'],['burger','Cheese Dip'],['burger','Tandoori Dip'],['burger','Hot Bihari Dip'],['burger','Fruit Iced Tea — Orange'],['burger','Fruit Iced Tea — Strawberry'],['burger','Fruit Iced Tea — Pineapple']]],
  ['Burger Singh wings, momos, and cheese bites-10.png', '5x2', [
    ['burger','Cheesy Coins (6 pcs)'],['burger','Karrre Murgh Pops'],['burger','Chicken Wings (Fried)'],['burger','Chicken Wings (Hotshock)'],['burger','Steamed Veg Momo (6 pcs)'],['burger','Steamed Paneer Momo (6 pcs)'],['burger','Steamed Chicken Momo (6 pcs)'],['burger','Fried Veg Momo (6 pcs)'],['burger','Fried Paneer Momo (6 pcs)'],['burger','Fried Chicken Momo (6 pcs)']]],
  ['Campus Eats Café Beverage Showcase-9.png', '5x2', [
    ['cafe','Café Mocha'],['cafe','Chai — Ginger'],['cafe','Chai — Masala'],['cafe','Chai — Cardamom'],['cafe','Garam Chai'],['cafe','Green Tea'],['cafe','Lemon Tea'],['cafe','Hot Chocolate'],['cafe','Badam Milk'],['cafe','Soup — Hot N Sour']]],
  ['GreeNox dessert and coffee sampler-8.png', '5x2', [
    ['greenox','Belgian Chocolate Ice Cream'],['greenox','American Nuts Ice Cream'],['greenox','Tutti Frutti Ice Cream'],['greenox','Butter Scotch Ice Cream'],['greenox','Hazelnut Coffee Ice Cream'],['greenox','Vanilla Ice Cream'],['greenox','Mix Berry Custard Jar'],['greenox','Exotic Fruit Custard Jar'],['greenox','Extra Waffle Cone'],['greenox','Espresso']]],
  ['Campus coffee and snack showcase-7.png', '5x2', [
    ['greenox','Café Latte'],['greenox','Café Mocha'],['greenox','Americano'],['greenox','Cappuccino'],['greenox','Roasted Cashew'],['cafe','Black Coffee — Espresso'],['cafe','Black Coffee — Americano'],['cafe','Café Latte'],['cafe','Flavoured Cappuccino — Hazelnut'],['cafe','Flavoured Cappuccino — Caramel']]],
  ['GreeNox campus eats menu contact sheet-6.png', '5x2', [
    ['greenox','Kulhad Chai'],['greenox','Hot Chocolate'],['greenox','Chilli Cheese Vegetable Maggi'],['greenox','Nachos Salsa'],['greenox','Mexican Veg Taco'],['greenox','Mexican Chicken Taco (2 pcs)'],['greenox','Extra Avocado'],['greenox','Guacamole'],['greenox','Chocolate Ice Cream'],['greenox','Strawberry Ice Cream']]],
  ['Campus Eats breakfast and beverage lineup-5.png', '5x2', [
    ['greenox','Passion Fruit Lemonade'],['greenox','Raspberry Splitzer'],['greenox','Vegetable Poha'],['greenox','Scrambled Egg'],['greenox','Fresh Fruit Glass'],['greenox','Boiled Egg'],['greenox','Bread Omelette'],['greenox','Adrak Chai'],['greenox','Honey Lemon Tea'],['greenox','Masala Chai']]],
  ['GreeNox ten-drink campus menu-4.png', '5x2', [
    ['greenox','Watermelon Beetroot Fusion Juice'],['greenox','ABC Red Nutritional Juice'],['greenox','Mix Fruit Juice'],['greenox','Lemon Iced Tea'],['greenox','Blue Lagoon Mint'],['greenox','Classic Mint Mojito'],['greenox','Masala Lemonade'],['greenox','Watermelon Mint Mojito'],['greenox','Aam Panna'],['greenox','Peach Iced Tea']]],
  ['Campus Eats burger and pasta contact sheet-2.png', '5x2', [
    ['greenox','Corn Cheese Sandwich'],['greenox','Grilled Chicken Burger'],['greenox','Paneer Mania Burger'],['greenox','Korean Veg Burger'],['greenox','Barbaresca (Mix Sauce) Chicken Pasta'],['greenox','Barbaresca (Mix Sauce) Pasta'],['greenox','Alfredo (White Sauce) Chicken Pasta'],['greenox','Arrabiata (Red Sauce) Chicken Pasta'],['greenox','Arrabiata (Red Sauce) Pasta'],['greenox','Alfredo (White Sauce) Veg Pasta']]],
  ['Campus Eats_ Pasta, Bowls & Shakes-1.png', '5x2', [
    ['greenox','Pesto (Classic Herb) Chicken Pasta'],['greenox','Pesto Pasta (Veg)'],['greenox','Mix Berry Granola Smoothie Bowl (7 Layer Buddha Bowl)'],['greenox','Mix Berries Kiwi & Nuts Smoothie Bowl'],['greenox','Biscoff Cheesecake'],['greenox','Protein Packed Smoothie'],['greenox','Whey Protein Shake'],['greenox','Mix Berry Shake'],['greenox','Peanut Butter Banana Shake'],['greenox','Belgian Chocolate Shake']]],
];

const keyFor = (outlet,name) => `${outlet}|${name}`;
const available = new Set(menu.map(p=>keyFor(p.outlet,p.name)));
const outDir='public/assets/illustrations/contact-sheets-2026';
fs.mkdirSync(outDir,{recursive:true});
const map={}; const provenance=[]; const missing=[];
for(const [filename,layout,tiles] of sheets){
  const source=path.join(D,filename);
  if(!fs.existsSync(source)){missing.push({filename,reason:'Source contact sheet not found in Downloads'});continue;}
  const meta=await sharp(source).metadata();
  const cols=layout==='3x1'?3:5, rows=layout==='3x1'?1:2;
  const cellW=meta.width/cols,cellH=meta.height/rows;
  for(let i=0;i<tiles.length;i++){
    const [outlet,name]=tiles[i],key=keyFor(outlet,name);
    if(!available.has(key)){missing.push({filename,tile:i+1,key,reason:'No exact catalog product; no image assigned'});continue;}
    if(map[key])continue;
    let left=Math.round((i%cols)*cellW), top=Math.round(Math.floor(i/cols)*cellH), width=Math.floor(cellW), height=Math.floor(cellH);
    // Exclude grid strokes and the tile number at top left.
    const insetX=layout==='3x1'?45:layout==='5x2wide'?28:34;
    const insetTop=layout==='3x1'?58:layout==='5x2wide'?38:42;
    left+=insetX; top+=insetTop; width-=insetX+(layout==='3x1'?45:10);
    const bottomPad=layout==='3x1'?190:layout==='5x2wide'?122:116;
    height-=insetTop+bottomPad;
    const hash=crypto.createHash('sha256').update(key).digest('hex').slice(0,16);
    const dest=`${outDir}/${hash}.webp`;
    await sharp(source).extract({left,top,width,height}).resize(650,650,{fit:'contain',background:'#f7f3eb'}).webp({quality:82,effort:5}).toFile(dest);
    map[key]=`/assets/illustrations/contact-sheets-2026/${hash}.webp`;
    provenance.push({outlet,name,source:filename,tile:i+1,image:map[key],treatment:'cropped dish only; label and tile number excluded'});
  }
}

const mapPath='lib/contact-sheet-product-art.ts';
fs.writeFileSync(mapPath,`export const contactSheetProductArt:Record<string,string>=${JSON.stringify(map,null,2)};\n`);
fs.writeFileSync('docs/CONTACT-SHEET-IMAGE-MAP.json',JSON.stringify({revision:'2026-11-02',count:Object.keys(map).length,images:provenance,notMapped:missing},null,2));
console.log(JSON.stringify({mapped:Object.keys(map).length,missingSources:missing.filter(x=>x.reason.includes('not found')).length,unmatched:missing.filter(x=>x.reason.startsWith('No exact')).length,assets:outDir},null,2));
