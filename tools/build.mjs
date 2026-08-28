import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { ScriptInfo } from '../src/script-info.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');
const distDir = path.resolve(rootDir, 'dist');
const outputFile = path.resolve(distDir, 'Melonbooks - Enhancements.user.js');

function generateUserscriptBanner(info) {
  const lines = [
    '// ==UserScript==',
    `// @name         ${info.name || 'Melonbooks - Enhancements'}`,
    `// @namespace    ${info.namespace || 'https://github.com/Netoxique/Melonbooks-Enhanced'}`,
    `// @version      ${info.version}`,
    `// @description  ${info.description || 'Comprehensive enhancements for Melonbooks browsing, shopping, layout, and library management.'}`,
    `// @author       ${info.author || 'Netoxique'}`,
    '// @match        https://*.melonbooks.co.jp/*',
    '// @match        https://melonbooks.co.jp/*',
    '// @match        http://www.melonbooks.co.jp/mypage/history.php*',
    '// @match        https://outlook.office.com/*',
    '// @match        https://outlook.live.com/*',
    '// @grant        GM_addStyle',
    '// @grant        GM_openInTab',
    '// @run-at       document-start',
    '// @updateURL    https://raw.githubusercontent.com/Netoxique/Melonbooks-Enhanced/main/dist/Melonbooks%20-%20Enhancements.user.js',
    '// @downloadURL  https://raw.githubusercontent.com/Netoxique/Melonbooks-Enhanced/main/dist/Melonbooks%20-%20Enhancements.user.js',
    '// ==/UserScript==',
    '',
    '// GENERATED FILE. DO NOT EDIT DIRECTLY.',
    '// Edit files under src/ and run the build.',
    ''
  ];
  return lines.join('\n');
}

async function bundleScript() {
  const bannerText = generateUserscriptBanner(ScriptInfo);

  const result = await esbuild.build({
    entryPoints: [path.resolve(srcDir, 'main.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: false,
    write: false,
    banner: {
      js: bannerText
    }
  });

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Build failed with ${result.errors.length} error(s)`);
  }

  return result.outputFiles[0].text;
}

async function run() {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');
  const isWatch = args.includes('--watch');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  if (isCheck) {
    console.log(`[Build] Checking if dist file is up to date with version ${ScriptInfo.version}...`);
    const currentCode = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : null;
    const newCode = await bundleScript();

    // Normalize newlines for comparison
    const normCurrent = currentCode ? currentCode.replace(/\r\n/g, '\n') : '';
    const normNew = newCode.replace(/\r\n/g, '\n');

    if (normCurrent !== normNew) {
      console.error('[Build Error] dist/Melonbooks - Enhancements.user.js is out of date or missing. Please run `npm run build`.');
      process.exit(1);
    }
    console.log('[Build] Verification passed. dist/ file is up to date.');
    return;
  }

  if (isWatch) {
    console.log(`[Build] Watching src/ for changes...`);
    const ctx = await esbuild.context({
      entryPoints: [path.resolve(srcDir, 'main.js')],
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: ['es2020'],
      minify: false,
      outfile: outputFile,
      banner: {
        js: generateUserscriptBanner(ScriptInfo)
      }
    });
    await ctx.watch();
    return;
  }

  console.log(`[Build] Building Melonbooks - Enhancements v${ScriptInfo.version}...`);
  const bundled = await bundleScript();
  fs.writeFileSync(outputFile, bundled, 'utf8');
  console.log(`[Build] Successfully wrote ${outputFile}`);
}

run().catch((err) => {
  console.error('[Build Error]', err);
  process.exit(1);
});
