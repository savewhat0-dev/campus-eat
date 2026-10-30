const labels:Record<string,string>={kathi:'Kathi Junction',greenox:'GreeNox',cafe:'Café Coffee Day',burger:'Burger Singh',dominos:'Domino’s Pizza'};

export function OutletLogo({id,className=''}:{id:string;className?:string}) {
 const label=labels[id]||'Campus food outlet';
 return <span role="img" aria-label={label} className={`outlet-logo-mark outlet-logo-${id} ${className}`}><img className="outlet-logo-symbol" src={`/assets/logos/${id}.webp`} alt="" loading="lazy"/></span>;
}
