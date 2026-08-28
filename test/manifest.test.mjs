import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const EXPECTED_HASHES = {
  'Melonbooks - Expand Search Columns.user.js': '6c572cd69149bcb1de30a8c80ea21e57549600ac6366b6399cccf96992a56fcf',
  'Melonbooks - Move product info below cart buttons.user.js': '8148c9486883676fcc23285341dcb4def003719ca01d970ea6aa792757d4d324',
  'MelonBooks - Cart Duplicate Warning.user.js': '1c39a1c012a090fcf1a9c9754faa9b207d6466da9c644b4ca02273bd3f05cb7f',
  'Melonbooks - Force Load Listing Images.user.js': 'faa04065169f7a24c71fc5494f8332bd8e7c7a10008c529b00451c7ba88929a6',
  'Melonbooks - Force Loads Details Page Thumbnails.user.js': '49c3e472de7d7fa10651d641431929da2170831e8dac7a8f8a60187967219662',
  'Melonbooks - My Orders Product Grid & Infinite Scroll.user.js': 'f2ee00f3ed71abb673ad9ca28414b3678f6d4adf993a19c0880a452ad40507c8',
  'Melonbooks - Product Page Circle Favorite Remover.user.js': 'b431dd8bd2fa7306cb7d0e2f6b78b528791e6b7315b76af93d4db9393f3b4b5c',
  'Melonbooks - Product Page Favorite Author Remover.user.js': 'fc92f25f49f0d71357f90e1f872328c3cfa52433cc83f20dd3896a7ff4509778',
  'Melonbooks - Listing hover.user.js': '73e2ee77a33a1373241f3a88edc86f9cee3ca9974fe3be14dc14ad1a4d17b70e',
  'Melonbooks - English Heading Translator.user.js': '76d43eadd4f9d701b1f0c4f860a489d2ebd97a9ab27d7695d5dc4cbc10aa4bbc',
  'Melonbooks - English Heading Translator (1).user.js': 'cdcf2744c22d425e90b410f9152756b71af89d0880af0944760eab2d54a36ba9',
  'Open Melonbooks links via VPN tab.user.js': '0a8f2a837358161ecf0c0d06ec506bd853bb010e40d14fbca777373970921875',
  'Melonbooks - Favorite Authors Infinite Scroll.user.js': 'fa5ee3dd0eed8d4bc37c321b4986a13a78047b28f109ecd00b642d649161ffa3',
  'Melonbooks - Wishlist Toggle.user.js': 'b3ec39a497c342b6cdb6f6e5becf6153a9d71911865f8bb0e980fc009a1e184b',
  'Melonbooks - Wishlist Infinite Scroll.user.js': '9c60b29f8af682221491eade0f5cc3a989f8d96062fbd2190d7d1b70c8822356'
};

test('Baseline Integrity - Standalone SHA-256 Hashes', () => {
  const legacyDir = path.resolve('legacy/standalone');
  const files = fs.readdirSync(legacyDir).filter((f) => f.endsWith('.user.js'));

  assert.equal(files.length, 15, 'All 15 legacy scripts are preserved');

  for (const file of files) {
    const filePath = path.join(legacyDir, file);
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    const expectedHash = EXPECTED_HASHES[file];
    assert.ok(expectedHash, `Expected hash exists for ${file}`);
    assert.equal(
      hash,
      expectedHash,
      `SHA-256 hash matches for ${file}`
    );
  }
});
