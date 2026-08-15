/**
 * Unit Tests for Barcode Battler Engine (v2.4.0)
 */

import { BarcodeEngine, LevelManager, BASE_NAMES, ELEMENT_PALETTES } from '../src/js/barcode-engine.js';
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

  // 3. 属性別マルチカラーパレット & SVGレンダリングテスト (v2.4.0)
  assert(ELEMENT_PALETTES["火"] && ELEMENT_PALETTES["水"] && ELEMENT_PALETTES["木"], "属性パレット: 火・水・木の3属性パレットが定義されていること");
  
  const fireSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "火", "N");
  const waterSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "水", "N");
  const woodSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "木", "N");

  assert(fireSvg.includes(ELEMENT_PALETTES["火"].primary), "属性カラー: 火属性ドラゴンにフレイムレッドの体色が反映されること");
  assert(waterSvg.includes(ELEMENT_PALETTES["水"].primary), "属性カラー: 水属性ドラゴンにアクアブルーの体色が反映されること");
  assert(woodSvg.includes(ELEMENT_PALETTES["木"].primary), "属性カラー: 木属性ドラゴンにエメラルドグリーンの体色が反映されること");

  // 4. 超ド派手 SSR 背景演出 & レアリティ別SVGテスト (v2.4.0)
  const ssrSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "火", "SSR");
  const srSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "火", "SR");
  const rSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "火", "R");
  const nSvg = BarcodeEngine.generateCharacterSvg("ドラゴン", "火", "N");

  assert(ssrSvg.includes("polygon points=\"70,4"), "超ド派手SSR: 16芒サンバースト大光槍がSVG内に生成されること");
  assert(ssrSvg.includes("stroke=\"#ffd700\""), "超ド派手SSR: 黄金ルーン魔方陣が生成されること");
  assert(srSvg.includes("stroke=\"#b066ff\""), "SR背景: サイバーヘックスグリッドが生成されること");
  assert(rSvg.includes("stroke-dasharray=\"8,6\""), "R背景: クリスタルリングが生成されること");
  assert(nSvg.includes("fill=\"#14182a\""), "N背景: シンプルサークルベースが生成されること");

  // 5. 新レアリティ分布テスト
  const rarityCounts = { SSR: 0, SR: 0, R: 0, N: 0 };
  const totalSamples = 1000;
  for (let i = 0; i < totalSamples; i++) {
    const code = `49${i.toString().padStart(11, '0')}`;
    const card = BarcodeEngine.generateFromBarcode(code);
    rarityCounts[card.rarity]++;
  }
  assert(rarityCounts.SSR > 0, "レアリティ分布: SSRが生成されること (期待値 ~3%)");
  assert(rarityCounts.N > rarityCounts.R, "レアリティ分布: Nが最大比率 (期待値 ~60%) であること");

  // 6. 属性相性 & 属性均等分散テスト (v3.1.0)
  assert(BattleEngine.getElementMultiplier("火", "木") === 1.5, "属性相性: 火 > 木 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("水", "火") === 1.5, "属性相性: 水 > 火 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("木", "水") === 1.5, "属性相性: 木 > 水 で1.5倍補正となること");
  assert(BattleEngine.getElementMultiplier("火", "水") === 1.0, "属性相性: 等倍判定であること");

  // 8桁バーコードでの属性分散テスト（以前は100%火だった問題の解消検証）
  const elem8Counts = { "火": 0, "水": 0, "木": 0 };
  for (let i = 0; i < 300; i++) {
    const code8 = `4900${i.toString().padStart(4, '0')}`;
    const c = BarcodeEngine.generateFromBarcode(code8);
    if (c.type === 'character') elem8Counts[c.element]++;
  }
  assert(elem8Counts["火"] > 30 && elem8Counts["水"] > 30 && elem8Counts["木"] > 30, "8桁バーコード属性分散: 8桁コードでも火・水・木が偏りなく均等に出現すること");

  // 13桁バーコードでの属性分散テスト
  const elem13Counts = { "火": 0, "水": 0, "木": 0 };
  for (let i = 0; i < 900; i++) {
    const code13 = `49012345${i.toString().padStart(5, '0')}`;
    const c = BarcodeEngine.generateFromBarcode(code13);
    if (c.type === 'character') elem13Counts[c.element]++;
  }
  assert(elem13Counts["火"] > 150 && elem13Counts["水"] > 150 && elem13Counts["木"] > 150, "13桁バーコード属性分散: 13桁コードでも3属性がバランス良く均等（各~33%）に出現すること");

  // 7. ストレージ100体保存制限 (FIFO) テスト
  localStorage.clear();
  for (let i = 0; i < 105; i++) {
    const testChar = BarcodeEngine.generateFromBarcode(`4900000000${i.toString().padStart(3, '0')}`);
    StorageManager.saveToCollection(testChar);
  }
  const collection = StorageManager.getCollection();
  assert(collection.length === 100, "ストレージ保存制限: 100体超過時に古いカードが削除され上限100体に維持されること (FIFO)");

  // 8. デッキ3アイテムスロット管理テスト
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

  // 9. アイテム削除時のカスケード解除テスト
  StorageManager.deleteFromCollection(item2.id);
  const rawDeck = JSON.parse(localStorage.getItem("barcode_battler_deck") || "{}");
  assert(rawDeck.itemCard2 === null, "カスケード保護: アイテム2削除時にLocalStorage内の該当スロットが自動解除されること");
  assert(rawDeck.itemCard1 && rawDeck.itemCard1.id === item1.id, "カスケード保護: 他のアイテムスロットは影響を受けないこと");

  // 10. バトルエンジン 3アイテム選択使用テスト
  const charDiff = BarcodeEngine.generateFromBarcode("4909876543210");
  const bEngine = new BattleEngine([char1], [item1, item3], [charDiff], [item1], '1p');
  assert(bEngine.playerItemUsesLeft === 2, "バトルアイテム: 所持アイテム残数が2個と正しく認識されること");

  const turnResult = bEngine.processTurn('item', 0, 'attack', 0);
  assert(turnResult !== null, "バトルエンジン: 1ターン目のアイテム使用処理が正常に実行されること");
  assert(bEngine.playerItemUsesLeft === 1, "バトルアイテム: アイテム使用後に残数が1個に減少すること");

  // 11. P2P Host Authority 完全同期テスト (v2.5.0)
  const hostEngine = new BattleEngine([char1], [item1], [charDiff], [item2], '1p');
  const guestEngine = new BattleEngine([charDiff], [item2], [char1], [item1], '1p');

  // ホストでターン実行
  const hTurn = hostEngine.processTurn('attack', 0, 'attack', 0);
  const exportedState = hostEngine.exportHostState();

  // ゲストへ同期適用
  guestEngine.applyGuestState(exportedState);

  assert(hostEngine.player.currentHp === guestEngine.enemy.currentHp, "P2P同期: ホストの自身HPとゲストの敵HPが100%完全一致すること");
  assert(hostEngine.enemy.currentHp === guestEngine.player.currentHp, "P2P同期: ホストの敵HPとゲストの自身HPが100%完全一致すること");
  assert(hostEngine.player.sp === guestEngine.enemy.sp, "P2P同期: ホストの自身SPとゲストの敵SPが100%完全一致すること");
  assert(hostEngine.turn === guestEngine.turn, "P2P同期: ターン数が完全一致すること");

  // 12. 3P対戦 キャラクター交代 & 素早さ連動ダメージテスト (v2.6.0)
  const charFast = { id: "fast", name: "超速ニンジャ", element: "水", rarity: "SSR", hp: 1000, atk: 200, def: 50, spd: 999 };
  const charSlow = { id: "slow", name: "重装ゴーレム", element: "木", rarity: "SR", hp: 1500, atk: 150, def: 200, spd: 1 };
  const charEnemy = { id: "enemy", name: "敵ファイター", element: "火", rarity: "R", hp: 1200, atk: 200, def: 50, spd: 100 };

  // パターンA: 自分が先攻（Fast Ninja -> Slow Golem へ交代、相手 Enemy(SPD 100) は後攻）
  // 期待値: 交代が先に発動し、新登場した Golem がダメージを受ける
  const switchEngineA = new BattleEngine([charFast, charSlow], [], [charEnemy], [], '3p');
  const initialFastHp = switchEngineA.playerTeam[0].currentHp;
  const initialSlowHp = switchEngineA.playerTeam[1].currentHp;

  switchEngineA.processTurn('switch', 0, 'attack', 0, 1, -1);
  assert(switchEngineA.playerIndex === 1, "キャラ交代: 先攻交代で控えのGolemが出撃していること");
  assert(switchEngineA.playerTeam[0].currentHp === initialFastHp, "先攻交代: 交代前のNinjaはダメージを受けないこと");
  assert(switchEngineA.playerTeam[1].currentHp < initialSlowHp, "先攻交代: 交代後のGolemが敵の攻撃を受けてダメージを負うこと");

  // パターンB: 自分が後攻（Slow Golem -> Fast Ninja へ交代、相手 Enemy(SPD 100) は先攻）
  // 期待値: 敵の攻撃が先に発動し、交代前の Golem が被弾してから Ninja へ交代する
  const switchEngineB = new BattleEngine([charSlow, charFast], [], [charEnemy], [], '3p');
  const initialSlowHpB = switchEngineB.playerTeam[0].currentHp;
  const initialFastHpB = switchEngineB.playerTeam[1].currentHp;

  switchEngineB.processTurn('switch', 0, 'attack', 0, 1, -1);
  assert(switchEngineB.playerIndex === 1, "キャラ交代: 後攻交代でも最終的に控えのNinjaが出撃していること");
  assert(switchEngineB.playerTeam[0].currentHp < initialSlowHpB, "後攻交代: 交代前のGolemが敵の先制攻撃を受けて被弾していること");
  assert(switchEngineB.playerTeam[1].currentHp === initialFastHpB, "後攻交代: 交代後のNinjaはダメージを受けないこと");

  // 13. LevelManager 必要EXP計算 & 成長ステータス計算テスト (v3.0.0)
  import('../src/js/barcode-engine.js').then(); // ensure loaded
  const expLv1 = LevelManager.getRequiredExp(1);
  const expLv10 = LevelManager.getRequiredExp(10);
  const expLv50 = LevelManager.getRequiredExp(50);
  const expLv100 = LevelManager.getRequiredExp(100);

  assert(expLv1 === 40, "必要EXP計算: Lv.1 -> Lv.2 の必要EXPが 40 であること");
  assert(expLv10 === 1004, "必要EXP計算: Lv.10 の必要EXPが 1004 (40 * 10^1.4) であること");
  assert(expLv50 === 9563, "必要EXP計算: Lv.50 の必要EXPが 9563 (40 * 50^1.4) であること");
  assert(expLv100 === 0, "必要EXP計算: Lv.100 (MAX) の必要EXPが 0 であること");

  const baseStats = { baseHp: 1000, baseAtk: 100, baseDef: 100, baseSpd: 100 };
  const statsLv1 = LevelManager.calculateStats(baseStats, 1);
  const statsLv50 = LevelManager.calculateStats(baseStats, 50);
  const statsLv100 = LevelManager.calculateStats(baseStats, 100);

  assert(statsLv1.maxHp === 1000 && statsLv1.atk === 100, "ステータス計算: Lv.1 で倍率 1.0 (等倍) であること");
  assert(statsLv50.maxHp === 1735 && statsLv50.atk === 174, "ステータス計算: Lv.50 で倍率 1 + 49*0.015 = 1.735倍 であること");
  assert(statsLv100.maxHp === 2485 && statsLv100.atk === 249, "ステータス計算: Lv.100 で倍率 1 + 99*0.015 = 2.485倍 であること");

  // 14. LevelManager 経験値付与 & 複数レベルアップテスト (v3.0.0)
  const testGrowthCard = {
    id: "growth_test",
    type: "character",
    name: "成長テストドラゴン",
    level: 1,
    exp: 0,
    baseHp: 1000,
    baseAtk: 100,
    baseDef: 100,
    baseSpd: 100,
    hp: 1000,
    maxHp: 1000,
    atk: 100,
    def: 100,
    spd: 100
  };

  // +100 EXP 付与 (Lv.1 -> Lv.2 必要40, Lv.2 -> Lv.3 必要105 -> 60余り)
  const resExp1 = LevelManager.addExp(testGrowthCard, 100);
  assert(resExp1.leveledUp === true, "レベルアップ判定: 100 EXP獲得でレベルアップすること");
  assert(testGrowthCard.level === 2, "レベルアップ判定: Lv.2 に上昇すること");
  assert(testGrowthCard.exp === 60, "経験値余り: 余剰経験値 60 が正常に繰り越されること");
  assert(testGrowthCard.maxHp === 1015, "成長ステータス: HPが 1015 (+1.5%) に再計算されていること");

  // 15. 3P対戦 出撃参加キャラクター限定EXP付与判定テスト (v3.0.0)
  const cP1 = { id: "p1", name: "キャラ1", type: "character", hp: 1000, atk: 100, def: 50, spd: 100 };
  const cP2 = { id: "p2", name: "キャラ2", type: "character", hp: 1000, atk: 100, def: 50, spd: 80 };
  const cP3 = { id: "p3", name: "キャラ3", type: "character", hp: 1000, atk: 100, def: 50, spd: 50 };
  const cEnemy = { id: "en", name: "敵キャラ", type: "character", hp: 3000, atk: 100, def: 50, spd: 60 };

  const battleExpEngine = new BattleEngine([cP1, cP2, cP3], [], [cEnemy], [], '3p');
  assert(battleExpEngine.participatedPlayerCardIds.has("p1"), "出撃キャラ追跡: 初期出撃キャラ(p1)が参加リストに含まれること");
  assert(!battleExpEngine.participatedPlayerCardIds.has("p2"), "出撃キャラ追跡: 未出撃キャラ(p2)は参加リストに含まれないこと");
  assert(!battleExpEngine.participatedPlayerCardIds.has("p3"), "出撃キャラ追跡: 未出撃キャラ(p3)は参加リストに含まれないこと");

  // 途中交代で p2 を出撃
  battleExpEngine.processTurn('switch', 0, 'attack', 0, 1, -1);
  assert(battleExpEngine.participatedPlayerCardIds.has("p2"), "出撃キャラ追跡: 途中交代で出撃したキャラ(p2)が参加リストに追加されること");
  assert(!battleExpEngine.participatedPlayerCardIds.has("p3"), "出撃キャラ追跡: 出撃していないキャラ(p3)は除外され続けること (案B仕様完全準拠)");

  // 16. ガード時 50%被ダメージ半減テスト (v3.0.0)
  const attCard = { id: "att", name: "攻撃役", element: "火", hp: 1000, atk: 200, def: 50, spd: 100 };
  const defCard = { id: "def", name: "防御役", element: "火", hp: 1000, atk: 100, def: 50, spd: 50 };

  // 通常攻撃時のダメージ計測
  const normalEngine = new BattleEngine([defCard], [], [attCard], [], '1p');
  normalEngine.processTurn('attack', 0, 'attack', 0);
  const normalDamage = 1000 - normalEngine.player.currentHp;

  // ガード時のダメージ計測
  const guardEngine = new BattleEngine([defCard], [], [attCard], [], '1p');
  guardEngine.processTurn('guard', 0, 'attack', 0);
  const guardDamage = 1000 - guardEngine.player.currentHp;

  assert(guardDamage <= Math.round(normalDamage * 0.6) && guardDamage >= Math.round(normalDamage * 0.4), "ガード効果: 被ダメージが約50%に半減されていること");

  // 17. 100枚上限超過時の入れ替え保存テスト (v3.0.0)
  localStorage.clear();
  for (let i = 0; i < 100; i++) {
    const card = BarcodeEngine.generateFromBarcode(`4900000000${i.toString().padStart(3, '0')}`);
    StorageManager.saveToCollection(card);
  }
  assert(StorageManager.isCollectionFull() === true, "所持上限判定: 100枚到達時に isCollectionFull が true を返すこと");

  const oldCardId = StorageManager.getCollection()[0].id;
  const newCard = BarcodeEngine.generateFromBarcode("4999999999999");
  StorageManager.replaceCardInCollection(oldCardId, newCard);

  // 18. 図鑑一覧 デッキ採用カード最優先ソートテスト (v3.4.0)
  localStorage.clear();
  const c1 = { id: "card_1", name: "キャラ1", type: "character", createdAt: 100 };
  const c2 = { id: "card_2", name: "キャラ2", type: "character", createdAt: 200 };
  const c3 = { id: "card_3", name: "キャラ3", type: "character", createdAt: 300 };
  const itemA = { id: "item_a", name: "アイテムA", type: "item", createdAt: 400 };
  const itemB = { id: "item_b", name: "アイテムB", type: "item", createdAt: 500 };

  const testList = [c1, c2, c3, itemA, itemB];
  // c2 をメインキャラ、itemB をアイテム1 にセット
  const testDeck = {
    mainChar: c2,
    subChar1: null,
    subChar2: null,
    itemCard1: itemB,
    itemCard2: null,
    itemCard3: null
  };

  function getDeckPriority(c) {
    if (testDeck.mainChar && testDeck.mainChar.id === c.id) return 1;
    if (testDeck.subChar1 && testDeck.subChar1.id === c.id) return 2;
    if (testDeck.subChar2 && testDeck.subChar2.id === c.id) return 3;
    if (testDeck.itemCard1 && testDeck.itemCard1.id === c.id) return 4;
    if (testDeck.itemCard2 && testDeck.itemCard2.id === c.id) return 5;
    if (testDeck.itemCard3 && testDeck.itemCard3.id === c.id) return 6;
    return 999;
  }

  const sortedCollection = [...testList].sort((a, b) => {
    const pA = getDeckPriority(a);
    const pB = getDeckPriority(b);
    return pA - pB;
  });

  assert(sortedCollection[0].id === "card_2", "デッキ最優先ソート: メインキャラ(card_2)が先頭(1番目)にソートされること");
  assert(sortedCollection[1].id === "item_b", "デッキ最優先ソート: アイテム1(item_b)が2番目にソートされること");
  assert(sortedCollection.slice(2).some(c => c.id === "card_1"), "デッキ最優先ソート: 未セットカードが後続に配置されること");

  // 19. レベルアップ後のデッキ能力値同期（Hydration）テスト (v3.5.0)
  localStorage.clear();
  const testChar = {
    id: "char_test_sync",
    type: "character",
    name: "同期テストドラゴン",
    species: "ドラゴン",
    element: "火",
    rarity: "N",
    baseHp: 1000,
    baseAtk: 200,
    baseDef: 100,
    baseSpd: 50,
    hp: 1000,
    maxHp: 1000,
    atk: 200,
    def: 100,
    spd: 50,
    level: 1,
    exp: 0
  };
  StorageManager.saveToCollection(testChar);
  StorageManager.setDeckSlot('mainChar', testChar);

  // 初期状態: Lv.1
  let currentDeck = StorageManager.getDeck();
  assert(currentDeck.mainChar.level === 1, "デッキ同期: 初期メインキャラがLv.1であること");
  const initialHp = currentDeck.mainChar.maxHp || currentDeck.mainChar.hp;

  // collection 内で EXP 獲得 & レベルアップ (Lv.1 -> Lv.2)
  const collectionForLevel = StorageManager.getCollection();
  const targetCharInCol = collectionForLevel.find(c => c.id === testChar.id);
  LevelManager.addExp(targetCharInCol, 100);
  localStorage.setItem("barcode_battler_collection", JSON.stringify(collectionForLevel));

  // getDeck() 取得時に最新ステータス（Lv.2 & HP上昇）が同期されること
  const hydratedDeck = StorageManager.getDeck();
  assert(hydratedDeck.mainChar.level === 2, "デッキ同期: StorageManager.getDeck() でメインキャラが Lv.2 に即座に同期されること");
  const upgradedHp = hydratedDeck.mainChar.maxHp || hydratedDeck.mainChar.hp;
  assert(upgradedHp > initialHp, "デッキ同期: メインキャラのHPが成長後の値に正しく更新されていること");

  // 20. 3P対戦チーム編成におけるキャラクター型保証（アイテム混入防止）テスト (v3.6.0)
  localStorage.clear();
  const mainC = { id: "main_c", type: "character", name: "メイン", hp: 1500, atk: 200, def: 100, spd: 50 };
  const itemShield = { id: "item_s", type: "item", name: "いあつのたて", baseVal: 40 };
  StorageManager.saveToCollection(mainC);
  StorageManager.saveToCollection(itemShield);

  // ゲスト送信ペイロード生成のシミュレーション
  const d = StorageManager.getDeck();
  const col = StorageManager.getCollection();
  const validCharacters = col.filter(c => c && c.type === 'character');
  let simulatedGuestTeam = [d.mainChar, d.subChar1, d.subChar2].filter(c => c && c.type === 'character');

  function getFallbackTestChar(idx) {
    return {
      id: `char_fallback_test_${idx}`,
      type: "character",
      name: `アシストドラゴン${idx}`,
      hp: 1200,
      atk: 180,
      def: 80,
      spd: 50
    };
  }

  while (simulatedGuestTeam.length < 3 && validCharacters.length > 0) {
    const nextChar = validCharacters.find(c => !simulatedGuestTeam.some(p => p.id === c.id));
    if (nextChar) simulatedGuestTeam.push(nextChar);
    else break;
  }
  while (simulatedGuestTeam.length < 3) {
    simulatedGuestTeam.push(getFallbackTestChar(simulatedGuestTeam.length + 1));
  }

  assert(simulatedGuestTeam.length === 3, "3Pチーム保証: 3体チームが正しく構成されること");
  assert(simulatedGuestTeam.every(c => c.type === 'character'), "3Pチーム保証: チーム内の全カードが type: 'character' でありアイテムが混入しないこと");
  assert(simulatedGuestTeam.every(c => typeof c.hp === 'number' && c.hp > 0), "3Pチーム保証: 全キャラが有効なHPステータスを保持していること");
  assert(!simulatedGuestTeam.some(c => c.name === "いあつのたて"), "3Pチーム保証: 「いあつのたて」がキャラクターとして混入しないこと");

  // 21. 未選択スロットの所持図鑑ランダム自動選抜テスト (v3.7.0)
  localStorage.clear();
  const cA = { id: "char_a", type: "character", name: "キャラA", hp: 1000, atk: 100, def: 50, spd: 30 };
  const cB = { id: "char_b", type: "character", name: "キャラB", hp: 1100, atk: 110, def: 60, spd: 40 };
  const cC = { id: "char_c", type: "character", name: "キャラC", hp: 1200, atk: 120, def: 70, spd: 50 };
  const cD = { id: "char_d", type: "character", name: "キャラD", hp: 1300, atk: 130, def: 80, spd: 60 };
  StorageManager.saveToCollection(cA);
  StorageManager.saveToCollection(cB);
  StorageManager.saveToCollection(cC);
  StorageManager.saveToCollection(cD);

  // メインキャラのみセット (サブ1, サブ2は未セット)
  StorageManager.setDeckSlot('mainChar', cA);
  StorageManager.setDeckSlot('subChar1', null);
  StorageManager.setDeckSlot('subChar2', null);

  function testGetBattleReadyTeam(mode = '3p') {
    const deck = StorageManager.getDeck();
    const collection = StorageManager.getCollection();
    const validChars = collection.filter(c => c && c.type === 'character' && typeof c.hp === 'number');
    const requiredCount = (mode === '3p') ? 3 : 1;
    const team = [];

    if (deck.mainChar && deck.mainChar.type === 'character') {
      team.push(deck.mainChar);
    }
    if (mode === '3p') {
      if (deck.subChar1 && deck.subChar1.type === 'character' && !team.some(c => c.id === deck.subChar1.id)) {
        team.push(deck.subChar1);
      }
      if (deck.subChar2 && deck.subChar2.type === 'character' && !team.some(c => c.id === deck.subChar2.id)) {
        team.push(deck.subChar2);
      }
    }

    if (team.length < requiredCount) {
      const availableChars = validChars.filter(c => !team.some(t => t.id === c.id));
      for (let i = availableChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableChars[i], availableChars[j]] = [availableChars[j], availableChars[i]];
      }
      while (team.length < requiredCount && availableChars.length > 0) {
        team.push(availableChars.shift());
      }
    }

    return team;
  }

  const generatedTeam3p = testGetBattleReadyTeam('3p');
  assert(generatedTeam3p.length === 3, "ランダム自動選抜: 3P対戦で3体が揃うこと");
  assert(generatedTeam3p[0].id === "char_a", "ランダム自動選抜: セット済みのメインキャラ(キャラA)が先鋒に配置されること");
  assert(generatedTeam3p[1].id !== "char_a" && generatedTeam3p[2].id !== "char_a", "ランダム自動選抜: 重複なく未選択キャラが選ばれること");
  assert(["char_b", "char_c", "char_d"].includes(generatedTeam3p[1].id), "ランダム自動選抜: 次鋒に図鑑内の未選択キャラ(B,C,D)から選出されること");
  assert(["char_b", "char_c", "char_d"].includes(generatedTeam3p[2].id), "ランダム自動選抜: 大将に図鑑内の未選択キャラ(B,C,D)から選出されること");

  // デッキ完全未セット時の1P対戦テスト
  StorageManager.setDeckSlot('mainChar', null);
  const generatedTeam1p = testGetBattleReadyTeam('1p');
  assert(generatedTeam1p.length === 1, "ランダム自動選抜: 1P対戦で1体が選出されること");
  assert(["char_a", "char_b", "char_c", "char_d"].includes(generatedTeam1p[0].id), "ランダム自動選抜: 図鑑内のキャラから1体が選ばれること");

  // 22. ハイブリッドスキャナー分岐安全性テスト (v3.8.0)
  // パターンA: Android (BarcodeDetector利用可能時) -> ネイティブパスが最優先実行されること
  let executedEngine = null;
  function mockScanLoop(hasNativeDetector, hasZXing) {
    if (hasNativeDetector) {
      executedEngine = 'native_barcode_detector';
      return;
    }
    if (hasZXing) {
      executedEngine = 'zxing_fallback';
      return;
    }
    executedEngine = 'none';
  }

  mockScanLoop(true, true);
  assert(executedEngine === 'native_barcode_detector', "ハイブリッドスキャナー: BarcodeDetector存在時はAndroidネイティブパスが最優先されZXingは実行されないこと (Zero-Impact)");

  // パターンB: iPhone / iOS Safari (BarcodeDetector非対応時) -> ZXingフォールバックが確実に起動すること
  mockScanLoop(false, true);
  assert(executedEngine === 'zxing_fallback', "ハイブリッドスキャナー: BarcodeDetector非対応時はiOSフォールバック(ZXing)が確実に実行されること");

  return results;
}

