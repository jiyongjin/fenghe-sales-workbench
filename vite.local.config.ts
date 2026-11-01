/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({ plugins: [react()], resolve: { alias: { '@': resolve(import.meta.dirname, '.') } }, build: { outDir: 'dist-local', emptyOutDir: true } });
