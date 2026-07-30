const entrypoints = ['./src/index.ts'];

const builds = await Promise.all(
  [
    { format: 'esm' as const, naming: '[dir]/[name].mjs' },
    { format: 'cjs' as const, naming: '[dir]/[name].cjs' },
  ].map(options =>
    Bun.build({
      entrypoints,
      outdir: './dist',
      external: ['react'],
      minify: true,
      sourcemap: 'external',
      target: 'browser',
      ...options,
    })
  )
);

for (const build of builds) {
  if (!build.success) {
    console.error(build.logs);
    process.exit(1);
  }
}

const typecheck = Bun.spawn(['bunx', 'tsc', '-p', 'tsconfig.build.json'], {
  stderr: 'inherit',
  stdout: 'inherit',
});

process.exit(await typecheck.exited);
