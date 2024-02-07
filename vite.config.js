import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import dotenv from 'dotenv';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

dotenv.config({
  path: resolve(process.cwd(), '.env'),
});

const UI_ENV_VARS = ['DFX_NETWORK', 'MAIN_CANISTER_ID'];

process.env = {
  ...process.env,
  ...UI_ENV_VARS.reduce(
    (accum, entry) => ({
      ...accum,
      [`VITE_${entry}`]: process.env[entry],
    }),
    {},
  ),
};

export default defineConfig({
    root: 'src/site/src',
    publicDir: '../public',
    plugins: [
        react(),
        wasm(),
        topLevelAwait(),
        checker({ typescript: true }),
        tsconfigPaths(),
        viteStaticCopy({
            targets: [
                {
                    src: '.ic-assets.json',
                    dest: '.',
                },
            ],
        })
    ],
    build: {
        rollupOptions: {
            output: {
                dir: resolve(process.cwd(), 'dist', 'site'),
                manualChunks: id => {
                    if (id.includes('@dfinity')) {
                        return 'dfinity-vendor';
                    }
                },
            },
        },
    },
    worker: {
        plugins: () => [
            wasm(),
            topLevelAwait()
        ]
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './src/test-setup',
        coverage: {
            provider: 'v8',
            all: true,
            include: ['src/**/*'],
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
    define: {
        'process.env': {
            DFX_NETWORK: process.env.DFX_NETWORK,
            MAIN_CANISTER_ID: process.env.MAIN_CANISTER_ID,
        },
    },
    server: {
        fs: {
            strict: false
        },
        proxy: {
            '/api': 'http://127.0.0.1:4943',
        },
    },
});