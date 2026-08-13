/**
 * Unit Tests for Barcode Battler Engine
 */

import { BarcodeEngine } from '../src/js/barcode-engine.js';
import { StorageManager } from '../src/js/storage.js';
import { BattleEngine } from '../src/js/battle-engine.js';

export function runAllTests() {
  const results = [];

  function assert(condition, testName) {
    if (condition) {
      results.push({ name: testName, status: 'PASSED' });
    } else {
      results.push({ name: testName, status: 'FAILED' });
      console.error(`Test FAILED: ${testName}`);
    }
  }

  // 1. 決定論的生成のテスト
  const char1 = BarcodeEngine.generateFromBarcode("4901234567890");
  const char2 = BarcodeEngine.generateFromBarcode("4901234567890");
  assert(char1.name === char2.name, "決定論的生成: 同一バーコードで同じ名前が生成されること");
  assert(char1.hp === char2.hp, "決定論的生成: 同一バーコードで同じHPが生成されること");
  assert(char1.element === char2.element, "決定論的生成: 同一バーコードで同じ属性が生成されること");

  // 2. 異種類バーコードテスト
  const charDiff = BarcodeEngine.generateFromBarcode("4909876543210");
  assert(char1.barcode !== charDiff.barcode, "異種類バーコードで異なるデータが生成されること");

  // 3. 属性相性テスト
  assert(BattleEngine.getElementMultiplier("火", "木") === 1.5, "属性相性: 火 > 木 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("水", "火") === 1.5, "属性相性: 水 > 火 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("木", "水") === 1.5, "属性相性: 木 > 水 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("火", "水") === 1.0, "属性相性: 等倍判定であること");

  // 4. ストレージ100体保存制限のテスト
  localStorage.clear();
  for (let i = 0; i < 105; i++) {
    const testChar = BarcodeEngine.generateFromBarcode(`4900000000${i.toString().padStart(3, '0')}`);
    StorageManager.saveToCollection(testChar);
  }
  const collection = StorageManager.getCollection();
  assert(collection.length === 100, "ストレージ保存制限: 100体超過時に古いカードが削除され上限100体に維持されること");

  // 5. メモ更新機能のテスト
  if (collection.length > 0) {
    const firstId = collection[0].id;
    StorageManager.updateMemo(firstId, "テスト用おかしメモ");
    const updatedCol = StorageManager.getCollection();
    const updatedCard = updatedCol.find(c => c.id === firstId);
    assert(updatedCard && updatedCard.memo === "テスト用おかしメモ", "メモ欄更新機能が正常に動作すること");
  }

  // 6. バトルエンジン処理テスト
  const bEngine = new BattleEngine(char1, null, charDiff, null);
  const turnResult = bEngine.processTurn('attack', false, 'attack', false);
  assert(turnResult !== null, "バトルエンジン: 1ターン目のコマンド処理が正常に実行されること");
  assert(bEngine.turn === 2, "バトルエンジン: ターン数が加算されること");

  return results;
}
