import { randomBytes, pbkdf2Sync } from 'node:crypto';
// Read five account objects through stdin. Never pass passwords as shell arguments.
let input='';for await(const chunk of process.stdin)input+=chunk;
const accounts=JSON.parse(input);
const ids=['kathi','greenox','cafe','burger','dominos'];
if(!Array.isArray(accounts)||accounts.length!==5||new Set(accounts.map(a=>a.username)).size!==5||!ids.every(id=>accounts.filter(a=>a.outlet===id).length===1))throw Error('Provide five unique usernames, one for each outlet.');
const result=accounts.map(({username,password,outlet})=>{if(typeof username!=='string'||!username.trim()||typeof password!=='string'||password.length<12)throw Error('Each username is required and password must contain at least 12 characters.');const salt=randomBytes(24).toString('hex');return {username:username.trim(),outlet,salt,hash:pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')};});
process.stdout.write(JSON.stringify(result));
