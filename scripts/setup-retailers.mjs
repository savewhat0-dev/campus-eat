import {createInterface} from 'node:readline';
import {Writable} from 'node:stream';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {spawnSync} from 'node:child_process';

if(!process.stdin.isTTY){console.error('Run this command in an interactive PowerShell or Windows Terminal window.');process.exit(1);}
let hidden=false;
const output=new Writable({write(chunk,encoding,done){if(!hidden)process.stdout.write(chunk);done();}});
const rl=createInterface({input:process.stdin,output,terminal:true});
rl.on('SIGINT',()=>{hidden=false;rl.close();console.log('\nCancelled.');process.exit(1);});
function ask(prompt,secret=false){return new Promise(resolve=>{rl.question(prompt,value=>{hidden=false;if(secret)process.stdout.write('\n');resolve(value);});hidden=secret;});}
try{
 const accounts=[];
 for(const [outlet,label]of [['kathi','Kathi Junction'],['greenox','Greenox'],['cafe','Cafe Coffee Day'],['burger','Burger Singh'],['dominos',"Domino's"]]){
  console.log('\n'+label);
  let username;do{username=(await ask('Choose username: ')).trim();if(!username||accounts.some(a=>a.username===username))console.log('Enter a nonempty, unique username.');}while(!username||accounts.some(a=>a.username===username));
  let password,confirmation;
  do{
   password=await ask('Choose password (12+ characters; typing stays hidden): ',true);
   confirmation=await ask('Confirm password (hidden): ',true);
   if(password.length<12||password.length>256||password!==confirmation)console.log('Passwords must match and contain 12 to 256 characters. Try again.');
  }while(password.length<12||password.length>256||password!==confirmation);
  const salt=randomBytes(24).toString('hex');
  accounts.push({username,outlet,salt,hash:pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')});
  password=confirmation=undefined;
 }
 rl.close();
 const json=JSON.stringify(accounts);
 const copied=spawnSync('clip.exe',[],{input:Buffer.from('\ufeff'+json,'utf16le'),windowsHide:true});
 if(copied.error||copied.status!==0)throw Error('Could not copy to Windows clipboard. Run this helper on Windows.');
 console.log('\nDone. Hashed configuration copied to your clipboard.');
 console.log('In Render > your web service > Environment, add RETAILER_ACCOUNTS and paste with Ctrl+V.');
 console.log('Save and deploy, then clear your clipboard. Keep the usernames/passwords in your password manager.');
 console.log('No password file was created.');
}catch(error){hidden=false;rl.close();console.error(error.message);process.exitCode=1;}
