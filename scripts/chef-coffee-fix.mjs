import fs from 'node:fs';
let s=fs.readFileSync('lib/wash-chat.ts','utf8').replace("const text=normal(m.name+' '+m.category);if", "const text=normal(m.name+' '+m.category);if(/cold coffee/.test(q)&&!/cold coffee/.test(normal(m.name)))return false;if");fs.writeFileSync('lib/wash-chat.ts',s);
