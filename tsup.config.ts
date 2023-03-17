import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { 'sample-plugin': 'src/main/ts/index.ts' },
  outDir: 'src/main/webapp/app',

  clean: true,
  sourcemap: false,

  // Enable type checking at compile time
  dts: true,

  // To minify output js, uncomment the following flag
  //minify: true,

  loader: {
    '.svg': 'dataurl',
    '.jpg': 'dataurl',
    '.md': 'text',
  },
})
