
import type {Item} from '../lib/catalog';
import {productImage} from '../lib/product-images';
import {productIllustration} from '../lib/product-illustrations';
import {Camera} from 'lucide-react';

export function MenuFood({item,className=''}:{item:Item;className?:string}){
 const photo=productImage(item);
 if(photo)return <div className={`menu-food-photo ${className}`}><img src={photo} alt={item.name+(item.variant?' · '+item.variant:'')} loading="lazy" decoding="async" width={650} height={650}/><small className="photo-label actual-photo-label">Outlet photo</small></div>;
 const illustration=productIllustration(item);
 if(illustration){const index=illustration.tile;return <div className={`menu-food-photo illustrated-product ${className}`}>{index!==undefined?<svg className="food-sheet-tile" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet" role="img" aria-label={item.name+' — AI-generated illustration'}><svg x={0} y={0} width={1} height={1} overflow="hidden"><image href={illustration.src} x={-(index%4)} y={-Math.floor(index/4)} width={4} height={4}/></svg></svg>:<img src={illustration.src} alt={item.name+' — AI-generated illustration'} loading="lazy" decoding="async" width={650} height={650}/>}<small className="photo-label">AI illustration</small></div>;}
 return <div className={`menu-food-photo missing-product-photo ${className}`}><Camera size={23}/><span>Photo not supplied<br/>by the outlet</span></div>;
}

