import assert from 'node:assert/strict';
import {publicOrigin} from '../render/config.mjs';
assert.equal(publicOrigin({RENDER:'true',RENDER_EXTERNAL_URL:'https://assigned.onrender.com'}),'https://assigned.onrender.com');
assert.equal(publicOrigin({RENDER:'true',RENDER_EXTERNAL_URL:'https://assigned.onrender.com',PUBLIC_ORIGIN:'https://food.example.com/'}),'https://food.example.com');
assert.equal(publicOrigin({PORT:'3077'}),'http://localhost:3077');
for(const PUBLIC_ORIGIN of ['http://unsafe.example','https://example.com/path','https://user:pass@example.com','invalid'])assert.throws(()=>publicOrigin({RENDER:'true',PUBLIC_ORIGIN}));
console.log('PASS: automatic Render URL, custom domain override and invalid origin rejection');
