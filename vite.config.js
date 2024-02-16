import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import dotenv from 'dotenv';
import environment from 'vite-plugin-environment';
import { fileURLToPath, URL } from 'url';

dotenv.config({
  path: resolve(process.cwd(), '.env'),
});

export default defineConfig({
    root: 'src/neuralarena_fe/src',
    publicDir: '../public',
    plugins: [
        environment("all", { prefix: "VITE_" }),
        environment("all", { prefix: "CANISTER_" }),
        environment("all", { prefix: "DFX_" }),
        react(),
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
        emptyOutDir: true,
        rollupOptions: {
            output: {
                dir: resolve(process.cwd(), 'dist', 'neuralarena_fe'),
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
    resolve: {
        alias: [
            {
                find: "declarations",
                replacement: fileURLToPath(
                    new URL("../declarations", import.meta.url)
                ),
            },
        ],
    },
    server: {
        fs: {
            strict: false
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:4943',
                changeOrigin: true,
            },
        },
    },
});