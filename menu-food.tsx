import type {CSSProperties} from 'react';
import type {Item} from '../lib/catalog';

function menuPhoto(item:Item):{sheet:number;tile:number}{
 const name=item.name.toLowerCase(),category=item.category.toLowerCase();
 if(/pizza/.test(name))return{sheet:1,tile:item.veg?12:13};
 if(/burger/.test(name)||category.includes('burger')||category.includes('chicken & mutton'))return{sheet:1,tile:item.veg?8:9};
 if(/momo/.test(name))return{sheet:item.veg?1:2,tile:11};
 if(/taco/.test(name))return{sheet:2,tile:8};
 if(/wing|murgh pop/.test(name))return{sheet:2,tile:9};
 if(/onion ring/.test(name))return{sheet:2,tile:10};
 if(/french fries|fries|potato wedge|batata vada|cheesy coin/.test(name))return{sheet:1,tile:10};
 if(/nacho/.test(name))return{sheet:2,tile:15};
 if(/ice cream|waffle cone|tutti frutti|butter scotch|american nuts/.test(name))return{sheet:2,tile:13};
 if(/omelette|upma|bun muska/.test(name))return{sheet:2,tile:14};
 if(/soup/.test(name))return{sheet:2,tile:12};
 if(/pasta|pazzta/.test(name))return{sheet:2,tile:2};
 if(/salad/.test(name))return{sheet:2,tile:/fruit/i.test(name)?3:item.veg?0:1};
 if(/roll/.test(name)||category.includes('roll'))return{sheet:1,tile:item.veg?0:1};
 if(/wrap|sub/.test(name))return{sheet:1,tile:7};
 if(/sandwich/.test(name))return{sheet:1,tile:6};
 if(/maggi|noodle/.test(name))return{sheet:1,tile:14};
 if(/iced tea|lemon iced/.test(name))return{sheet:2,tile:7};
 if(/cold coffee|frappe|milkshake/.test(name))return{sheet:1,tile:15};
 if(/hot chocolate/.test(name))return{sheet:2,tile:6};
 if(/chai|tea/.test(name))return{sheet:2,tile:5};
 if(/coffee|cappuccino|latte|mocha|espresso|badam milk|^milk$/.test(name))return{sheet:2,tile:4};
 if(/naan|roti|paratha|bread/.test(name))return{sheet:1,tile:3};
 if(/curry|dal|main course/.test(name)||category.includes('main course'))return{sheet:1,tile:2};
 if(/bowl|rice/.test(name))return{sheet:1,tile:item.veg?4:5};
 return{sheet:item.veg?2:1,tile:item.veg?0:1};
}

export function MenuFood({item,className=''}:{item:Item;className?:string}){
 const {sheet,tile}=menuPhoto(item),row=Math.floor(tile/4),column=tile%4;
 const style={backgroundImage:`url('/assets/menu-food-atlas-${sheet}.png')`,backgroundPosition:`${column*100/3}% ${row*100/3}%`} as CSSProperties;
 return <div className={`menu-food-photo ${className}`} role="img" aria-label={item.name} style={style}/>;
}
