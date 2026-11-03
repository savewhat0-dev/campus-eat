import type {Item} from './catalog';
export function productImage(item:Item){return item.photoApproved&&(item.image.startsWith('/api/campus/product-images/')||item.image.startsWith('data:image/'))?item.image:undefined;}
