const limit = 10 * 1024;
const bundles = ['dist/index.mjs', 'dist/index.cjs'];

for (const bundle of bundles) {
  const size = (await Bun.file(bundle).arrayBuffer()).byteLength;
  if (size > limit) {
    throw new Error(`${bundle} is ${size} bytes; limit is ${limit} bytes.`);
  }
  console.log(`${bundle}: ${size} bytes`);
}
