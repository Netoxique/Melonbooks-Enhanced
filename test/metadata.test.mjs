import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ScriptInfo } from '../src/script-info.js';

test('Metadata - ScriptInfo properties', () => {
  assert.equal(typeof ScriptInfo.name, 'string');
  assert.equal(typeof ScriptInfo.version, 'string');
  assert.match(ScriptInfo.version, /^\d+\.\d+\.\d+$/);
  assert.equal(typeof ScriptInfo.description, 'string');
  assert.equal(typeof ScriptInfo.author, 'string');
});

test('Metadata - Userscript header in dist', () => {
  const distPath = path.resolve('dist/Melonbooks - Enhancements.user.js');
  assert.ok(fs.existsSync(distPath), 'dist userscript file exists');

  const content = fs.readFileSync(distPath, 'utf8');
  assert.ok(content.startsWith('// ==UserScript=='), 'starts with userscript banner');
  assert.ok(content.includes('// ==/UserScript=='), 'contains userscript closing banner');
  assert.ok(content.includes(`// @version      ${ScriptInfo.version}`), 'contains matching version');
  assert.ok(content.includes('// @grant        GM_addStyle'), 'contains GM_addStyle grant');
  assert.ok(content.includes('// @grant        GM_openInTab'), 'contains GM_openInTab grant');
  assert.ok(content.includes('// @run-at       document-start'), 'contains run-at document-start');
  assert.ok(content.includes('// @match        https://*.melonbooks.co.jp/*'), 'matches melonbooks https wildcard');
  assert.ok(content.includes('// @match        https://outlook.office.com/*'), 'matches outlook office');
  assert.ok(content.includes('// @match        https://outlook.live.com/*'), 'matches outlook live');
});
