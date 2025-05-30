import type { NextConfig } from "next";
import path from 'node:path';
import fs from 'node:fs';

// needed by react-pdf
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = path.join(pdfjsDistPath, 'cmaps');
fs.cpSync(cMapsDir, 'dist/cmaps/', { recursive: true });

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: false,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;