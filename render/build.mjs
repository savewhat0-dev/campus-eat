import {build} from 'esbuild';
import {resolve} from 'node:path';
await build({entryPoints:['lib/api.ts'],bundle:true,platform:'node',format:'esm',outfile:'dist-render/api.mjs',alias:{'cloudflare:workers':resolve('render/env.mjs')}});
