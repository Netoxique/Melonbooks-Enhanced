import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrderStatusTone,
  normalizeOrderStatusText
} from '../src/modules/order-status-colors.js';

test('Order Status Colors - normalizes status whitespace', () => {
  assert.equal(normalizeOrderStatusText('  出荷準備を\n開始しました  '), '出荷準備を開始しました');
});

test('Order Status Colors - maps known statuses to their configured colors', () => {
  assert.equal(getOrderStatusTone('ご予約'), 'reserved');
  assert.equal(getOrderStatusTone('出荷準備を開始しました'), 'preparing');
  assert.equal(getOrderStatusTone('発送が完了しました'), 'shipped');
  assert.equal(getOrderStatusTone('受取済み'), 'received');
});

test('Order Status Colors - uses red fallback for unknown non-empty statuses', () => {
  assert.equal(getOrderStatusTone('新しい注文状況'), 'other');
  assert.equal(getOrderStatusTone('   '), null);
});
