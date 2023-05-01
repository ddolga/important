import * as esbuild from "esbuild"
import envFilePlugin from 'esbuild-envfile-plugin';

esbuild.build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    outfile: './dist/imp.build.js',
    platform: "node",
    minify: true,
    format: "cjs",
    plugins: [envFilePlugin]
});
