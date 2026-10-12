import type { NextConfig } from 'next';

export default {
  outputFileTracingRoot: process.cwd(),
  // The whole stylesheet is ~6 KB gzipped: inlining it removes the only render-blocking request.
  experimental: { inlineCss: true },
} satisfies NextConfig;
