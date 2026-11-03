import {generatedProductArt} from '../lib/generated-product-art';
import {contactSheetProductArt} from '../lib/contact-sheet-product-art';

import type {Item} from '../lib/catalog';
import {productImage} from '../lib/product-images';
import {productIllustration} from '../lib/product-illustrations';
import {Camera} from 'lucide-react';
import {useState} from 'react';

export function MenuFood({item,className=''}:{item:Item;className?:string}){
 const key=item.outlet+'|'+item.name;
 const legacy=item.illustrationApproved===false?undefined:productIllustration(item);
 const candidates=[{src:productImage(item),actual:true,tile:undefined},{src:contactSheetProductArt[key],actual:false,tile:undefined},{src:generatedProductArt[key],actual:false,tile:undefined},...(legacy?[{...legacy,actual:false}]:[])].filter((p,i,a)=>p.src&&a.findIndex(q=>q.src===p.src&&q.tile===p.tile)===i);
 return <FoodImage key={item.id+'|'+item.name+'|'+item.image+'|'+item.photoApproved} item={item} className={className} candidates={candidates}/>;
}

function FoodImage({item,className,candidates}:{item:Item;className:string;candidates:{src?:string;actual:boolean;tile?:number}[]}){
 const [index,setIndex]=useState(0);const current=candidates[index];
 if(!current)return <div className={`menu-food-photo missing-product-photo ${className}`}><Camera size={23}/><span>Image unavailable</span></div>;
 const label=current.actual?'Outlet photo':'AI illustration';const fail=()=>setIndex(n=>n+1);
 return <div className={`menu-food-photo ${current.actual?'':'illustrated-product'} ${className}`}>
 {current.tile!==undefined?<svg key={index} className="food-sheet-tile" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet" role="img" aria-label={item.name+' — '+label}><svg width={1} height={1} overflow="hidden"><image href={current.src} onError={fail} x={-(current.tile%4)} y={-Math.floor(current.tile/4)} width={4} height={4}/></svg></svg>:<img key={index} src={current.src} onError={fail} alt={item.name+' — '+label} loading="lazy" decoding="async" width={650} height={650}/>}
 <small className={'photo-label'+(current.actual?' actual-photo-label':'')}>{label}</small></div>;
}

