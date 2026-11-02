const labels:Record<string,string>={kathi:'Kathi Junction',greenox:'GreeNox',cafe:'Café Coffee Day',burger:'Burger Singh',dominos:'Domino’s Pizza'};

export function OutletLogo({id,className=''}:{id:string;className?:string}) {
 const label=labels[id]||'Maggi Point';
 if(id==='maggi')return <span role="img" aria-label="Maggi Point" className={`outlet-logo-mark ${className}`} style={{background:'#fff8e8',color:'#8e2721',fontWeight:800,fontSize:12,textAlign:'center'}}>Maggi<br/>Point</span>;
 return <span role="img" aria-label={label} className={`outlet-logo-mark outlet-logo-${id} ${className}`}><img className="outlet-logo-symbol" src={`/assets/logos/${id}.webp`} alt="" loading="lazy"/></span>;
}
