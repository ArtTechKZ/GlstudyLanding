import path from 'node:path';
import fs from 'node:fs';
import {validateSnapshot} from './cms/content-contract.mjs';
import react from '@vitejs/plugin-react'
import {assertLeadRelease} from './scripts/lead-release-gate.mjs';
import { defineConfig,loadEnv } from 'vite'
import site from './src/config/site.json' with { type: 'json' }
export default defineConfig(({ command, isPreview,mode }) => {const releaseEnv={...loadEnv(mode,process.cwd(),''),...process.env};return ({
  resolve: {alias:[{find:/^(?:.*\/)?content-snapshot\.json$/,replacement:path.resolve(process.env.GL_CONTENT_SNAPSHOT??'src/data/content-snapshot.json')}]},
  base: command === 'build' || isPreview ? site.base : '/',
  define: { __GL_PUBLIC_RU__: JSON.stringify(process.env.GL_RELEASE_PROFILE === 'public-ru') },
  plugins: [react(),{name:'validate-gl-content',buildStart(){const snapshot=validateSnapshot(JSON.parse(fs.readFileSync(process.env.GL_CONTENT_SNAPSHOT??'src/data/content-snapshot.json','utf8')));assertLeadRelease(snapshot,releaseEnv)}}],
  server: { fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/sandbox-access.json', '**/.qa/**/cms-runtime/**', '**/.qa/study24/**', '**/server/**', '**/cms/**', '**/.qa/**/cms-backup/**', '**/cms/runtime/data/**', '**/cms/runtime/uploads/**'] } },
  build: { manifest: true, outDir:process.env.GL_DIST_DIR??'dist' },
})})
