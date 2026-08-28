import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, translateText } from '../src/modules/heading-translator.js';

test('Heading Translator - Dictionary reconciliation', () => {
  // Verify reconciled keys from both legacy variants
  assert.equal(TRANSLATIONS.get('【ランキング】'), 'Ranking');
  assert.equal(
    TRANSLATIONS.get('サークル(先生)からのコメント/作品詳細'),
    'Circle/Creator Comments and Product Details'
  );
  assert.equal(TRANSLATIONS.get('作品詳細'), 'Product Details');
  assert.equal(TRANSLATIONS.get('作品情報'), 'Product Information');
  assert.equal(TRANSLATIONS.get('店舗在庫'), 'Store Inventory');
});

test('Heading Translator - Translation logic', () => {
  assert.equal(translateText('作品情報'), 'Product Information');
  assert.equal(translateText('【ランキング】'), 'Ranking');
  assert.equal(translateText('  作品詳細  '), 'Product Details');
  assert.equal(translateText('Random Heading'), 'Random Heading');
});
