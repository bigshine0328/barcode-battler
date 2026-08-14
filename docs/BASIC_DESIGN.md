# 📐 バーコードバトラー (Barcode Battler) - 基本設計書 (Basic Design Document)

**ドキュメントバージョン**: v2.4.0 (20種族・新レアリティ確率・アイテム3枠仕様改定版)  
**最終更新日**: 2026年8月15日  
**ステータス**: 設計承認要請中 (Pending Design Approval)  
**対象プラットフォーム**: モバイルWeb / PC Web (PWA / レスポンシブ対応)  
**公開URL**: `https://bigshine0328.github.io/barcode-battler/`

---

## 1. システムアーキテクチャ・全体構成

### 1.1 全体アーキテクチャ図（SPA & WebRTC P2P分散構成）

本システムは、完全フロントエンド完結型のシングルページアプリケーション（SPA）として動作し、WebRTC DataChannelを用いた端末間P2P（Peer-to-Peer）通信によってリアルタイムマルチプレイヤー対戦を実現します。

```
+---------------------------------------------------------------------------------------------------+
|                                      Client Browser (Host / Guest)                                |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                              UI Layer (HTML5 & Vanilla CSS3)                                |  |
|  |  SCR-01 [Home]  / SCR-02 [Scan]  / SCR-03 [Result] / SCR-04 [Deck] / SCR-05 [Lobby]         |  |
|  |  SCR-06 [Battle] / SCR-07 [Battle Result] / History Router / Item Selection Modal           |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                | (Event / State Binding)                          |
|  +---------------------------------------------------------------------------------------------+  |
|  |                         Application Core Engine (src/js/bundle.js)                          |  |
|  |                                                                                             |  |
|  |   +-------------------+    +--------------------+    +--------------------+                 |  |
|  |   |   BarcodeEngine   |    |   StorageManager   |    |    BattleEngine    |                 |  |
|  |   | (20 Species/SVG)  |    |  (100枚FIFO/3Item) |    |  (3 Items Select)  |                 |  |
|  |   +-------------------+    +--------------------+    +--------------------+                 |  |
|  |                                                                                             |  |
|  |   +-------------------------------------------------------------------------------------+   |  |
|  |   |                NetworkManager (PeerJS WebRTC DataChannel Wrapper)                   |   |  |
|  |   +-------------------------------------------------------------------------------------+   |  |
|  +---------------------------------------------------------------------------------------------+  |
|                        |                                             |                            |
|             (Web MediaDevices / BarcodeDetector)           (WebRTC P2P DataChannel)               |
+------------------------|---------------------------------------------|----------------------------+
                         v                                             v
               [ Device Camera / JAN ]                     [ Opponent Client Device ]
                                                                       ^
                                            (Signaling / Handshake)    |
                                         +-----------------------------+
                                         | PeerJS Cloud Signaling Svr  |
                                         | (Broker for Peer ID match)  |
                                         +-----------------------------+
```

### 1.2 ディレクトリ構成 & ファイル責務一覧

```
barcode-battler/
├── index.html                  # メインHTML（全画面コンテナ SCR-01 〜 SCR-07、アイテム選択UI）
├── docs/                       # プロジェクト設計・要件定義ドキュメント群
│   ├── PRD.md                  # プロダクト要件定義書 (v2.3.0)
│   ├── BASIC_DESIGN.md         # 基本設計書 (本ドキュメント v2.4.0)
│   ├── UI_Design.md            # UI/UX デザイン仕様書 (v2.3.0 統合版)
│   ├── Review_Report.md        # 要件・設計レビュー報告書
│   ├── QA_Report.md            # テスト計画・品質検証レポート
│   └── project-status.md       # プロジェクト管理・SSTシート
├── src/
│   ├── css/
│   │   └── style.css           # グローバルCSS (3Itemハイライト、Glassmorphism)
│   └── js/
│       ├── bundle.js           # 本番配信用 単一統合バンドルスクリプト (ES6+)
│       ├── barcode-engine.js   # 20種族ハッシュ計算・新レアリティ・ステータス/SVG生成
│       ├── storage.js          # LocalStorage永続化・3アイテムスロット管理・FIFO
│       ├── battle-engine.js    # 3アイテム選択使用・3P交代・ダメージ計算・CPU思考
│       ├── network.js          # PeerJS WebRTC P2P通信ラッパー (3Item同期対応)
│       └── ui.js               # DOM操作・アイテム3種ハイライト描画・モーダル制御
└── tests/
    └── run-tests.js            # 20種族・新レアリティ確率・3アイテム単体テストスイート
```

### 1.3 アプリケーション状態管理設計 (Global AppState)

```typescript
interface AppState {
  currentScreen: 'SCR-01' | 'SCR-02' | 'SCR-03' | 'SCR-04' | 'SCR-05' | 'SCR-06' | 'SCR-07';
  scannedCard: CharacterCard | ItemCard | null;
  selectedCardForDetail: CharacterCard | ItemCard | null;
  collectionSubTab: 'all' | 'char' | 'item';
  matchMode: '1p' | '3p';
  isOnlineMatch: boolean;
  myTurnAction: { type: 'attack' | 'skill' | 'guard' | 'item'; itemIndex?: number } | null;
  oppTurnAction: { type: 'attack' | 'skill' | 'guard' | 'item'; itemIndex?: number } | null;
  activeBattle: BattleEngine | null;
  networkState: {
    roomCode: string | null;
    isHost: boolean;
    isConnected: boolean;
    peerId: string | null;
  };
}
```

---

## 2. コアモジュール & ビジネスロジック詳細仕様

### 2.1 BarcodeEngine (バーコード解析 & 生成エンジン)

#### ① ハッシュ値算出アルゴリズム
JANコード文字列（13桁/8桁）から32bit整数ハッシュを決定論的に算出します。

```javascript
static hashBarcode(codeStr) {
  let cleaned = (codeStr || "4901234567890").replace(/\D/g, '') || "4901234567890";
  let hash = 0;
  for (let i = 0; i < cleaned.length; i++) {
    hash = ((hash << 5) - hash) + cleaned.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

#### ② 新レアリティ判定式 & ステータス倍率仕様
ハッシュスコア $\text{RarityScore} = \text{Hash} \pmod{100}$ により、以下の新確率分布（SSR: 3%, SR: 12%, R: 25%, N: 60%）で判定します。

| レアリティ | 確率閾値 ($\text{RarityScore}$) | 出現確率 | キャラステータス倍率 ($\text{Mult}$) | アイテム効果倍率 ($\text{ItemMult}$) |
|---|---|---|---|---|
| **SSR** | $0 \le \text{Score} < 3$ | **上位 3%** | **$\times 1.60$** | **$\times 2.50$** |
| **SR** | $3 \le \text{Score} < 15$ | **上位 12%** | **$\times 1.35$** | **$\times 1.70$** |
| **R** | $15 \le \text{Score} < 40$ | **上位 25%** | **$\times 1.15$** | **$\times 1.25$** |
| **N** | $40 \le \text{Score} < 100$ | **残り 60%** | **$\times 1.00$** | **$\times 1.00$** |

#### ③ 全20種族・名前・属性決定式
- **全20種族ベースリスト**:
  ```javascript
  const BASE_NAMES = [
    "ドラゴン", "ゴーレム", "ナイト", "フェニックス", "タイガー",
    "スライム", "ベア", "ロボ", "ウルフ", "ライオン",
    "イエティ", "グリフォン", "バトロボ", "クラーケン", "ペガサス",
    "キマイラ", "デーモン", "レヴィアタン", "ネクロマンサー", "ファントム"
  ];
  ```
- **種族インデックス**: $\text{SpeciesIndex} = (\text{Hash} + 1) \pmod{20}$
- **接頭語**: $\text{PrefixIndex} = \text{Hash} \pmod{\text{PREFIXES.length}}$
- **接尾語**: $\text{SuffixIndex} = (\text{Hash} + 2) \pmod{\text{SUFFIXES.length}}$
- **属性（3すくみ）**: $\text{ElementIndex} = d_{13} \pmod 3$ （0: 火, 1: 水, 2: 木、有利属性へダメージ **1.5倍**）
- **専用SVGマッピング**: `SPECIES_SVGS[baseSpeciesName]` により20種族すべてに固有のベクター画像を完全一致描画。

#### ④ 強化アイテム全8種 効果仕様 (アイテムカード)
$\text{Hash} \pmod 5 = 0$（20%確率）でアイテムカードを生成。効果値は $\text{round}(\text{BaseVal} \times \text{ItemMult})$。
1. **えりくさー** (`heal`): HP回復 (Base 300 / SSR 750)
2. **はかいのつるぎ** (`buff_atk`): ATKバフ (Base +60 / SSR +150)
3. **いあつのたて** (`buff_def`): DEFバフ (Base +50 / SSR +125)
4. **ひかりのたびびと** (`buff_spd`): SPDバフ (Base +40 / SSR +100)
5. **びくとりーのたま** (`charge_sp`): SP即座に100%充填
6. **まほうのばくだん** (`bomb`): 相手に固定ダメージ (Base 200 / SSR 500)
7. **ふ死鳥の水** (`heal_def`): HP回復 (Base 200 / SSR 500) & DEFバフ (+40 / SSR +100)
8. **おうかんの輝き** (`all_buff`): ATK/DEF/SPD一括バフ (Base +30 / SSR +75)

---

### 2.2 StorageManager (3アイテムスロット & 100枚FIFO管理)

#### ① デッキデータ構造 (`UserDeck`)
```typescript
interface UserDeck {
  mainChar: CharacterCard | null;
  subChar1: CharacterCard | null;
  subChar2: CharacterCard | null;
  itemCard1: ItemCard | null; // ★アイテムスロット1
  itemCard2: ItemCard | null; // ★アイテムスロット2
  itemCard3: ItemCard | null; // ★アイテムスロット3
}
```

#### ② デッキセット & 整合性保護
- `setDeckSlot(slotType, card)`: `slotType` に `itemCard1`, `itemCard2`, `itemCard3` を受け付け、アイテムカードのみセットを許可。
- `deleteFromCollection(cardId)`: カード削除時、`itemCard1`, `itemCard2`, `itemCard3` のいずれかにセットされていれば該当スロットを自動的に `null` に解除。

#### ③ 所持上限（100枚）FIFO自動押し出し制御
- 101枚目の新規カード保存時、`collection.shift()` により最古カードを自動削除。

---

### 2.3 BattleEngine (3アイテム選択使用 & コマンドバトル)

#### ① 3アイテムスロットの管理 & 選択使用フロー
- バトル開始時、プレイヤーはデッキにセットされた `[itemCard1, itemCard2, itemCard3]` を所持（最大3個）。
- コマンドで `item` を選択した際、使用するアイテムのインデックス（`0, 1, 2`）を指定。
- 各アイテムは **1バトルにつき1回ずつ使用可能**。使用済みアイテムは消費され、未消費のアイテムのみ再選択可能（最大合計3回使用）。
- 敵（CPU）も所持する最大3個のアイテムから状況に応じて未消費アイテムを1個ずつ消費。

#### ② 行動順 & ダメージ計算
$$\text{ActionPriority} = \text{SPD} \times (0.85 + \text{Random}(0.0 \sim 0.30)) \quad (\text{ガード時は最優先 } 9999)$$
$$\text{BaseDamage} = \text{ATK} \times 2.5 \times \left( \frac{100}{100 + \text{DEF} \times 0.35} \right) \quad (\text{最低保障 } \text{ATK} \times 0.50)$$
$$\text{FinalDamage} = \max\left(1, \text{round}\left(\text{RawDamage} \times \text{ElementMult} \times \text{Rand}(0.95 \sim 1.05) \times \text{GuardReduction}\right)\right)$$

#### ③ 3Pチーム戦 交代仕様
- 出撃キャラHP 0時にサブ1 ➔ サブ2へ自動交代（SPはリセット0%）。20ターン経過時は生存数 ➔ 残HP比率で勝敗判定。

---

### 2.4 NetworkManager (PeerJS P2P 3アイテム同期)

#### ① 通信メッセージスキーマ
- `JOIN_REQUEST` / `JOIN_ACCEPT`: `deck` に `itemCard1`, `itemCard2`, `itemCard3` を格納して送信。
- `TURN_ACTION`:
  ```json
  {
    "type": "TURN_ACTION",
    "action": "item",
    "itemIndex": 0 // 0, 1, 2
  }
  ```
- `TURN_RESULT`: 最新の確定ステータス、両者のアイテム消費状態、ターンログを配信。

---

## 3. UI/UX 画面設計 & 3アイテムハイライト仕様

### 3.1 SCR-04 [図鑑画面] 3アイテム同時ハイライト仕様
図鑑カードレンダリング時、以下の判定ロジックにより、セットされた3種類のアイテムすべてに個別のバッジを表示し、ハイライト枠線（`is-deck-set`）を付与します。

```javascript
let slotBadgeHtml = "";
let isSet = false;

if (deck.mainChar && deck.mainChar.id === c.id) {
  slotBadgeHtml = `<span class="slot-badge badge-main">⚔️ メイン</span>`; isSet = true;
} else if (deck.subChar1 && deck.subChar1.id === c.id) {
  slotBadgeHtml = `<span class="slot-badge badge-sub1">🛡️ サブ1</span>`; isSet = true;
} else if (deck.subChar2 && deck.subChar2.id === c.id) {
  slotBadgeHtml = `<span class="slot-badge badge-sub2">🛡️ サブ2</span>`; isSet = true;
} else if (deck.itemCard1 && deck.itemCard1.id === c.id) {
  slotBadgeHtml = `<span class="slot-badge badge-item">💊 アイテム1</span>`; isSet = true;
} else if (deck.itemCard2 && deck.itemCard2.id === c.id) {
  slotBadgeHtml = `<span class="slot-badge badge-item">💊 アイテム2</span>`; isSet = true;
} else if (deck.itemCard3 && deck.itemCard3.id === c.id) {
  slotBadgeHtml = `<span class="slot-badge badge-item">💊 アイテム3</span>`; isSet = true;
}
```

### 3.2 SCR-06 [バトル画面] アイテム選択ポップアップ
バトル画面下部の `💊 アイテム (残りX/3)` ボタンをタップした際、セットされている3つのアイテムをリスト表示する選択モーダルを開き、タップされたアイテムを発動します。

---

## 4. 要件トレーサビリティ (PRD v2.3.0 カバレッジ確認表)

| PRD 要件項目 | PRD仕様概要 | 基本設計書 対応セクション | 実装・設計ステータス |
|---|---|---|:---:|
| **F-01** | 全20種族モンスター生成 & 新レアリティ分布 (SSR 3%, SR 12%, R 25%, N 60%) | 2.1 (②, ③) | ✅ 網羅 |
| **F-02** | 属性相性 (火・木・水 1.5倍) | 2.1 (③) | ✅ 網羅 |
| **F-03** | 強化アイテム8種生成 & 効果倍率 | 2.1 (④) | ✅ 網羅 |
| **F-04** | 図鑑管理 & アイテム3枚同時ハイライト表示 | 2.2, 3.1 | ✅ 網羅 |
| **F-05** | デッキ編成 (3キャラ + 3アイテムスロット) | 2.2 (①, ②) | ✅ 網羅 |
| **F-06** | P2Pオンライン対戦 (3アイテム同期 & 切断処理) | 2.4 | ✅ 網羅 |
| **F-07** | CPU対戦モード (敵3アイテム所持) | 2.3 (①) | ✅ 網羅 |
| **F-08** | バトルコマンド (3種アイテム選択使用 & 3〜5ターン決着) | 2.3, 3.2 | ✅ 網羅 |
