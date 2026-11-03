import {validateCustomerDetails,type CustomerDetails} from './order-flow';
export type Course={id:string;name:string;years:number[]};
// Published BMU programmes; administrators can replace this list with COURSE_OPTIONS.
// Sources: https://www.bmu.edu.in/courses/ and https://admissions.bmu.edu.in/
export const defaultCourses:Course[]=[
 {id:'btech',name:'B.Tech',years:[1,2,3,4]},
 {id:'bba',name:'BBA / BBA (Hons.)',years:[1,2,3,4]},
 {id:'bcom',name:'B.Com (Hons.)',years:[1,2,3,4]},
 {id:'integrated-bba-mba',name:'Integrated BBA–MBA',years:[1,2,3,4,5]},
 {id:'ba-llb',name:'BA LL.B. (Hons.)',years:[1,2,3,4,5]},
 {id:'bba-llb',name:'BBA LL.B. (Hons.)',years:[1,2,3,4,5]},
 {id:'llb',name:'LL.B.',years:[1,2,3]},
 ...['Economics','Psychology','Sociology','Literature','History'].map(n=>({id:'ba-'+n.toLowerCase(),name:`BA (Hons.) ${n}`,years:[1,2,3,4]})),
 {id:'mba',name:'MBA',years:[1,2]},
 {id:'ma-public-policy',name:'MA Public Policy',years:[1,2]},
 {id:'phd',name:'PhD',years:[1,2,3,4,5,6]},
 {id:'faculty',name:'Faculty / Staff',years:[0]},
];
export function configuredCourses(value?:string):Course[]{
 if(!value)return defaultCourses;
 try{const rows=JSON.parse(value);if(!Array.isArray(rows)||!rows.length||rows.length>80)throw Error();
 if(rows.some(c=>typeof c.id!=='string'||typeof c.name!=='string'||!Array.isArray(c.years)||!c.years.length||c.years.some(y=>!Number.isInteger(y)||y<0||y>10)))throw Error();return rows;
 }catch{throw Error('COURSE_OPTIONS must contain an array of course IDs, names and valid year lists.');}
}
export type CompleteProfile=CustomerDetails&{course:string;year:number};
export function validateProfile(input:unknown,courses=defaultCourses):CompleteProfile{
 const p=input as any,details=validateCustomerDetails(p),course=courses.find(c=>c.id===p?.course),year=Number(p?.year);
 if(!course)throw Error('Choose your course from the university programme list.');
 if(p?.year===''||p?.year==null||!course.years.includes(year))throw Error('Choose a valid year for your course.');
 return {...details,course:course.id,year};
}
export function profileComplete(p:unknown,courses=defaultCourses){try{validateProfile(p,courses);return true;}catch{return false;}}
