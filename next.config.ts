import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Emits .next/standalone with a self-contained server.js, so the runtime image
  // carries only the traced dependencies rather than all of node_modules.
  output: 'standalone',

  outputFileTracingIncludes: {
    /*
      Prisma 7 loads its Postgres query compiler through a dynamic import of a
      wasm module. Next's tracer follows static imports reliably but can miss
      the wasm payload behind that call, and the failure only shows up at
      runtime as a missing-module error inside the container. Naming it here
      makes the inclusion explicit rather than incidental.
    */
    '/**': [
      './node_modules/@prisma/client/runtime/*.mjs',
      './node_modules/@prisma/client/runtime/*.wasm',
      './src/generated/prisma/**/*',
    ],
  },
}

export default nextConfig
