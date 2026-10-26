const labels:Record<string,string>={kathi:'Kathi Junction',greenox:'GreeNox',cafe:'Café Coffee Day',burger:'Burger Singh',dominos:'Domino’s Pizza'};

export function OutletLogo({id,className=''}:{id:string;className?:string}) {
 const label=labels[id]||'Campus food outlet';
 return <span className={`outlet-logo-mark outlet-logo-${id} ${className}`}><img src={`/assets/logo-${id}.png`} alt={label+' logo'} loading="lazy"/></span>;
}
