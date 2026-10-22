/* Lets `node --test` run the app's TypeScript modules as-is: Node strips the
   types itself, this hook only adds the `.ts` extension that bundler-style
   imports ("./motion") leave out. */
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
