import type {Item} from './catalog.ts';
export type Illustration={src:string;tile?:number;label:string};
const art=(key:string):Illustration=>({src:'/assets/illustrations/'+key+'.webp',label:'AI-generated illustration'});
const tile=(sheet:number,index:number):Illustration=>({src:`/assets/illustrations/food-sheet-${sheet}.webp`,tile:index,label:'AI-generated illustration'});
// These are representative illustrations, never outlet-approved product photos.
// Closely related recipes/sizes deliberately share an illustration.
export function productIllustration(p:Item):Illustration|undefined{
 const n=p.name.toLowerCase(),c=p.category.toLowerCase();
 if(/dip$/.test(n))return art('dip');
 if(/waffle cone/.test(n))return art('waffle-cone');
 if(c==='ice cream')return /vanilla|mango|tutti/.test(n)?art('vanilla-icecream'):tile(2,13);
 if(/onion rings/.test(n))return tile(2,10);
 if(/cheesy coins/.test(n))return art('cheese-coins');
 if(/batata vada/.test(n))return art('batata-vada');
 if(/murgh pops/.test(n))return art('chicken-pops');
 if(/wings/.test(n))return tile(2,9);
 if(/momo/.test(n)&&!c.includes('burger')&&!c.includes('chicken'))return /fried|kurkure/.test(n)?tile(2,11):tile(1,11);
 if(/nachos/.test(n))return tile(2,15);
 if(/wedges/.test(n))return art('potato-wedges');
 if(/fries/.test(n))return /chees/.test(n)?art('cheesy-fries'):art('fries');
 if(c.includes('burger')||p.outlet==='burger'&&c==='chicken & mutton')return p.veg?art('vegburger'):tile(1,9);
 if(c.includes('pizza')){
   if(!p.veg)return tile(1,13);
   return /margherita|4 cheese/.test(n)?art('margherita'):tile(1,12);
 }
 if(/salad/.test(c)){
   if(/fruit/.test(n))return tile(2,3);
   if(/pesto/.test(n))return tile(2,2);
   if(!p.veg)return /quinoa/.test(n)?tile(1,5):tile(2,1);
   if(/falafel/.test(n))return art('falafel-salad');
   return /caesar/.test(n)?art('caesar-salad'):tile(1,4);
 }
 if(/sandwich/.test(c))return p.veg?tile(1,6):art('chicken-sandwich');
 if(/sub$/.test(n))return p.veg?art('veg-sub'):tile(1,7);
 if(/roll|wrap/.test(n)){
   if(/mutton/.test(n))return art('mutton-roll');
   if(/chicken|non veg/.test(n))return tile(1,1);
   if(/egg/.test(n))return art('egg-roll');
   if(/paneer|cheesy tikka/.test(n))return art('paneer-roll');
   if(/soya/.test(n))return art('soya-roll');
   if(/mushroom/.test(n))return art('mushroom-roll');
   if(/aloo/.test(n))return art('aloo-roll');
   if(/falafel/.test(n))return art('falafel-wrap');
   return art('veg-wrap');
 }
 if(c==='main course'){
   if(/dal/.test(n))return art(/fry/.test(n)?'yellow-dal':'dal');
   if(/egg/.test(n))return art('egg-curry');
   if(/mutton/.test(n))return art('mutton-curry');
   if(/chicken/.test(n))return art('chicken-curry');
   if(/paneer/.test(n))return art('paneer-curry');
   if(/chaap/.test(n))return art('soya-curry');
   return art('vegetable-curry');
 }
 if(c==='breads')return /naan/.test(n)?tile(1,3):/paratha/.test(n)?art('paratha'):art('roti');
 if(/bowl/.test(c))return p.veg?art('veg-rice-bowl'):art('chicken-rice-bowl');
 if(/taco/.test(n))return p.veg?tile(2,8):art('chicken-taco');
 if(/upma/.test(n))return art('upma');
 if(/bun muska/.test(n))return art('bun-muska');
 if(/omelette/.test(n))return tile(2,14);
 if(/fruit bowl/.test(n))return tile(2,3);
 if(/sweet corn|corn extras/.test(n))return art('sweet-corn');
 if(/soup/.test(n))return tile(2,12);
 if(/pasta|pazzta|pesto|alfredo|arrabbiata/.test(n)||c==='pasta')return /alfredo|cheese pazzta|mushroom pazzta/.test(n)?art('white-pasta'):/pesto/.test(n)?tile(2,2):art('red-pasta');
 if(/maggi/.test(n)||c==='maggi & pasta')return tile(1,14);
 if(/badam/.test(n))return art('badam-milk');
 if(n==='milk')return art('milk');
 if(/milkshake/.test(n))return art('milkshake');
 if(/iced? tea/.test(n))return tile(2,7);
 if(/cold coffee|frappe/.test(n))return art('coldcoffee');
 if(/hot chocolate|mocha|moha/.test(n))return tile(2,6);
 if(/black coffee|espresso/.test(n))return art('black-coffee');
 if(/chai|tea/.test(n))return tile(2,5);
 if(/coffee|cappuccino|latte/.test(n))return art('coffee');
 return undefined;
}
