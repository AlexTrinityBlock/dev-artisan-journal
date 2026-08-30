// ESM shim for the CommonJS `picomatch` package.
//
// Why this file exists:
// Astro's content-collection sync (astro sync) builds a Vite dev server with
// `ssr: { external: [] }`, which forces every dependency through Vite's module
// runner as inlined source. Vite 8 no longer ships an in-process CommonJS
// transform, so the raw CJS source of `picomatch` (a transitive dep of
// `tinyglobby`, used by Astro's glob content loader) keeps bare `require()`
// calls that the ESM evaluator cannot satisfy — "require is not defined".
//
// Aliasing `picomatch` to this wrapper (see astro.config.mjs) makes every
// importer load the CJS module through Node's own `createRequire`, which works
// in the module runner, in the optimizer, and in rollup builds alike.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const picomatch = require('picomatch');

export default picomatch;
