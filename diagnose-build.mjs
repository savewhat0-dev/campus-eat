import {inspect} from 'node:util';
import {build} from 'vite';

try {
  await import('./restore-product-images.mjs');
  await build({configFile:'vite.render.config.mjs'});
  await import('./build.mjs');
} catch (error) {
  console.error('\nBMU EATS BUILD DIAGNOSTIC:');
  console.error(inspect(error,{depth:12,colors:false,maxArrayLength:30,maxStringLength:12000}));
  for (const nested of error.errors || []) {
    console.error('INNER ERROR:',inspect(nested,{depth:12,colors:false,maxStringLength:12000}));
  }
  process.exitCode=1;
}
