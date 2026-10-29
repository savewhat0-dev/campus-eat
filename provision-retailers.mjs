import { randomBytes, pbkdf2Sync } from 'node:crypto';
// Read five account objects through stdin. Never pass passwords as shell arguments.
const fail=code=>{process.stderr.write(code);process.exit(2);};
let input='';for await(const chunk of process.stdin)input+=chunk;
// Windows PowerShell 5.1 may prefix redirected stdin with a UTF-8 BOM.
if(input.charCodeAt(0)===0xfeff)input=input.slice(1);
let accounts;try{accounts=JSON.parse(input);}catch{fail('INVALID_JSON_INPUT');}
const ids=['kathi','greenox','cafe','burger','dominos'];
if(!Array.isArray(accounts)||accounts.length!==5||!ids.every(id=>accounts.filter(a=>a?.outlet===id).length===1))fail('INVALID_ACCOUNT_SET');
const usernames=accounts.map(a=>typeof a?.username==='string'?a.username.trim().toLowerCase():'');
if(usernames.some(x=>!x)||new Set(usernames).size!==5)fail('INVALID_OR_DUPLICATE_USERNAME');
if(accounts.some(a=>typeof a?.password!=='string'||a.password.length<12))fail('PASSWORD_TOO_SHORT');
const result=accounts.map(({username,password,outlet})=>{const salt=randomBytes(24).toString('hex');return {username:username.trim(),outlet,salt,hash:pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')};});
process.stdout.write(JSON.stringify(result));
