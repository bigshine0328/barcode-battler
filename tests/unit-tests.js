/**
 * Unit Tests for Barcode Battler Engine (v2.3.0)
 */

import { BarcodeEngine, BASE_NAMES } from '../src/js/barcode-engine.js';
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

  // 2. 20種族の生成テスト
  assert(BASE_NAMES.length === 20, "20種族定義: BASE_NAMES が20種類定義されていること");
  const generatedSpecies = new Set();
  for (let i = 0; i < 200; i++) {
    const code = `4900000000${i.toString().padStart(3, '0')}`;
    const card = BarcodeEngine.generateFromBarcode(code);
    if (card.type === 'character') {
      generatedSpecies.add(card.species);
    }
  }
  assert(generatedSpecies.size >= 10, "20種族生成: 多様な種族が決定論的に生成されること");

  // 3. 新レアリティ分布テスト
  const rarityCounts = { SSR: 0, SR: 0, R: 0, N: 0 };
  const totalSamples = 1000;
  for (let i = 0; i < totalSamples; i++) {
    const code = `49${i.toString().padStart(11, '0')}`;
    const card = BarcodeEngine.generateFromBarcode(code);
    rarityCounts[card.rarity]++;
  }
  assert(rarityCounts.SSR > 0, "レアリティ分布: SSRが生成されること (期待値 ~3%)");
  assert(rarityCounts.N > rarityCounts.R, "レアリティ分布: Nが最大比率 (期待値 ~60%) であること");

  // 4. 属性相性テスト
  assert(BattleEngine.getElementMultiplier("火", "木") === 1.5, "属性相性: 火 > 木 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("水", "火") === 1.5, "属性相性: 水 > 火 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("木", "水") === 1.5, "属性相性: 木 > 水 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("火", "水") === 1.0, "属性相性: 等倍判定であること");

  // 5. ストレージ100体保存制限 (FIFO) テスト
  localStorage.clear();
  for (let i = 0; i < 105; i++) {
    const testChar = BarcodeEngine.generateFromBarcode(`4900000000${i.toString().padStart(3, '0')}`);
    StorageManager.saveToCollection(testChar);
  }
  const collection = StorageManager.getCollection();
  assert(collection.length === 100, "ストレージ保存制限: 100体超過時に古いカードが削除され上限100体に維持されること (FIFO)");

  // 6. デッキ3アイテムスロット管理テスト
  const item1 = BarcodeEngine.generateFromBarcode("4900000000001");
  const item2 = BarcodeEngine.generateFromBarcode("4900000000006");
  const item3 = BarcodeEngine.generateFromBarcode("4900000000010");

  assert(item1.type === 'item' && item2.type === 'item' && item3.type === 'item', "アイテム生成: 3つのテストアイテムが正常にアイテムとして生成されること");

  StorageManager.saveToCollection(item1);
  StorageManager.saveToCollection(item2);
  StorageManager.saveToCollection(item3);

  const setRes1 = StorageManager.setDeckSlot('itemCard1', item1);
  const setRes2 = StorageManager.setDeckSlot('itemCard2', item2);
  const setRes3 = StorageManager.setDeckSlot('itemCard3', item3);

  assert(setRes1 && setRes2 && setRes3, "デッキセット: 3つのアイテムスロットへのセットが成功すること");

  const deck = StorageManager.getDeck();
  assert(deck.itemCard1 && deck.itemCard1.id === item1.id, "デッキ編成: アイテム1が正しくセットされること");
  assert(deck.itemCard2 && deck.itemCard2.id === item2.id, "デッキ編成: アイテム2が正しくセットされること");
  assert(deck.itemCard3 && deck.itemCard3.id === item3.id, "デッキ編成: アイテム3が正しくセットされること");

  // 7. アイテム削除時のカスケード解除テスト
  StorageManager.deleteFromCollection(item2.id);
  const rawDeck = JSON.parse(localStorage.getItem("barcode_battler_deck") || "{}");
  assert(rawDeck.itemCard2 === null, "カスケード保護: アイテム2削除時にLocalStorage内の該当スロットが自動解除されること");
  assert(rawDeck.itemCard1 && rawDeck.itemCard1.id === item1.id, "カスケード保護: 他のアイテムスロットは影響を受けないこと");

  // 8. バトルエンジン 3アイテム選択使用テスト
  const charDiff = BarcodeEngine.generateFromBarcode("4909876543210");
  const bEngine = new BattleEngine([char1], [item1, item3], [charDiff], [item1], '1p');
  assert(bEngine.playerItemUsesLeft === 2, "バトルアイテム: 所持アイテム残数が2個と正しく認識されること");

  const turnResult = bEngine.processTurn('item', 0, 'attack', 0);
  assert(turnResult !== null, "バトルエンジン: 1ターン目のアイテム使用処理が正常に実行されること");
  assert(bEngine.playerItemUsesLeft === 1, "バトルアイテム: アイテム使用後に残数が1個に減少すること");

  return results;
}
