# 📐 システム基本設計書 (BASIC_DESIGN.md)

- **システム名**: バーコードバトラー Web アプリケーション
- **バージョン**: `v2.5.0` (Multi-Element Color & Ultra SSR Edition)
- **最終更新日**: 2026年8月15日
- **作成担当**: `software-engineer`

---

## 1. システム構成 & アーキテクチャ

- **フロントエンド**: HTML5 / CSS3 / Vanilla ES6+ JavaScript（単一バンドル `src/js/bundle.js`）
- **P2P通信**: WebRTC / PeerJS (Host Authority パターン)
- **永続化**: ブラウザ LocalStorage (100枚FIFO・デッキ3スロット保存・カスケード保護)

---

## 2. グラフィック & スプライト生成ロジック

### 2.1 属性マルチカラーパレット (`ELEMENT_PALETTES`)
```javascript
export const ELEMENT_PALETTES = {
  "火": { primary: "#ff2200", secondary: "#ffd700", dark: "#880011", eye: "#ffff00", pupil: "#000000", accent: "#ff6600" },
  "水": { primary: "#0088ff", secondary: "#e0ffff", dark: "#002266", eye: "#00ffff", pupil: "#ffffff", accent: "#00e5ff" },
  "木": { primary: "#00aa44", secondary: "#aaffaa", dark: "#003311", eye: "#ffff33", pupil: "#003300", accent: "#00ff88" }
};
```

### 2.2 レアリティ別背景演出 (`generateCharacterSvg`)
- **SSR**: 16芒サンバースト大光槍（`<polygon points="70,4 ...">`）＋ 黄金ルーン魔方陣 ＋ 星屑スパークル ＋ 黄金グラデーション
- **SR**: サイバーオーラ ＋ ヘックス幾何学グリッド（六角形）
- **R**: クリスタルリング ＋ エナジー粒子
- **N**: ディープネイビー円形ベースプレート ＋ アークティックライン

---

## 3. デッキ & 図鑑3アイテム連動仕様

- `AppState.deck` スキーマ:
  ```typescript
  interface DeckState {
    mainChar: Card | null;
    subChar1: Card | null;
    subChar2: Card | null;
    itemCard1: Card | null;
    itemCard2: Card | null;
    itemCard3: Card | null;
  }
  ```
- 図鑑描画時、`deck.itemCard1`, `deck.itemCard2`, `deck.itemCard3` すべてに個別バッジ（`[💊 アイテム1]`, `[💊 アイテム2]`, `[💊 アイテム3]`）を付与し、3枚同時にハイライト表示。
- バトルエンジンは所持アイテム配列（最大3個）を管理し、未消費のアイテムを個別に選択発動可能。
