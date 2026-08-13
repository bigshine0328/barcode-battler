/**
 * Barcode Battler - Barcode Engine Module
 * JAN13 / JAN8 の解読、決定論的ステータス・名前・グラフィック生成を担当
 */

// ワードリスト定義 (4,000通りの名前組み合わせ)
const PREFIXES = [
  "ばくえんの", "そうかいの", "しっぷうの", "でんせつの", "すーぱー",
  "はらぺこ", "むてきの", "きらめく", "あくまの", "てんしの",
  "いかずちの", "ふぶきの", "ごうきゅうの", "のんびり", "ハイパー",
  "まぼろしの", "やみのおう", "ひかりの", "ワイルド", "ミラクル"
];

const BASE_NAMES = [
  "ドラゴン", "ゴーレム", "ナイト", "フェニックス", "タイガー",
  "スライム", "ベア", "ロボ", "ウルフ", "ライオン",
  "サメ", "カメ", "タカ", "コウモリ", "バトロボ",
  "クラーケン", "ペガサス", "キマイラ", "パンダ", "キャット"
];

const SUFFIXES = [
  "バトラー", "キング", "マスター", "ヒーロー", "ビースト",
  "ガード", "ファイター", "ロード", "チャンピオン", "レジェンド"
];

// モンスターベースのアセット表現 (SVGテンプレート)
const MONSTER_SILHOUETTES = [
  // 0: ドラゴン
  `<svg viewBox="0 0 100 100"><path d="M50 15 L65 35 L85 30 L70 55 L80 85 L50 70 L20 85 L30 55 L15 30 L35 35 Z" fill="currentColor"/><circle cx="40" cy="35" r="4" fill="#fff"/><circle cx="60" cy="35" r="4" fill="#fff"/></svg>`,
  // 1: ゴーレム
  `<svg viewBox="0 0 100 100"><rect x="25" y="20" width="50" height="40" rx="8" fill="currentColor"/><rect x="15" y="30" width="15" height="45" rx="5" fill="currentColor"/><rect x="70" y="30" width="15" height="45" rx="5" fill="currentColor"/><rect x="30" y="60" width="15" height="30" rx="4" fill="currentColor"/><rect x="55" y="60" width="15" height="30" rx="4" fill="currentColor"/><circle cx="40" cy="35" r="5" fill="#fff"/><circle cx="60" cy="35" r="5" fill="#fff"/></svg>`,
  // 2: ナイト
  `<svg viewBox="0 0 100 100"><path d="M50 10 L75 35 L70 90 L30 90 L25 35 Z" fill="currentColor"/><rect x="35" y="30" width="30" height="8" fill="#fff"/><path d="M50 90 L85 50 L50 10" fill="none" stroke="currentColor" stroke-width="4"/></svg>`,
  // 3: フェニックス
  `<svg viewBox="0 0 100 100"><path d="M50 15 C30 30 10 20 5 45 C25 45 35 60 50 85 C65 60 75 45 95 45 C90 20 70 30 50 15 Z" fill="currentColor"/><circle cx="50" cy="30" r="4" fill="#fff"/></svg>`,
  // 4: タイガー
  `<svg viewBox="0 0 100 100"><path d="M20 20 L40 30 L50 15 L60 30 L80 20 L75 55 L85 85 L15 85 L25 55 Z" fill="currentColor"/><circle cx="35" cy="40" r="4" fill="#fff"/><circle cx="65" cy="40" r="4" fill="#fff"/></svg>`,
  // 5: スライム
  `<svg viewBox="0 0 100 100"><path d="M50 20 C75 20 90 45 90 70 C90 85 75 90 50 90 C25 90 10 85 10 70 C10 45 25 20 50 20 Z" fill="currentColor"/><ellipse cx="38" cy="50" rx="6" ry="8" fill="#fff"/><ellipse cx="62" cy="50" rx="6" ry="8" fill="#fff"/><ellipse cx="39" cy="50" rx="3" ry="4" fill="#000"/><ellipse cx="63" cy="50" rx="3" ry="4" fill="#000"/></svg>`,
  // 6: ロボ
  `<svg viewBox="0 0 100 100"><rect x="30" y="15" width="40" height="30" rx="4" fill="currentColor"/><rect x="20" y="45" width="60" height="35" rx="4" fill="currentColor"/><rect x="35" y="25" width="30" height="8" fill="#00e5ff"/><rect x="25" y="80" width="15" height="15" fill="currentColor"/><rect x="60" y="80" width="15" height="15" fill="currentColor"/></svg>`,
  // 7: カメ
  `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="35" ry="25" fill="currentColor"/><circle cx="85" cy="50" r="12" fill="currentColor"/><circle cx="20" cy="70" r="8" fill="currentColor"/><circle cx="70" cy="70" r="8" fill="currentColor"/><circle cx="88" cy="46" r="3" fill="#fff"/></svg>`,
  // 8: パンダ
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="32" fill="currentColor"/><circle cx="25" cy="28" r="12" fill="currentColor"/><circle cx="75" cy="28" r="12" fill="currentColor"/><ellipse cx="38" cy="50" rx="8" ry="6" fill="#000"/><ellipse cx="62" cy="50" rx="8" ry="6" fill="#000"/><circle cx="38" cy="50" r="3" fill="#fff"/><circle cx="62" cy="50" r="3" fill="#fff"/></svg>`,
  // 9: サメ
  `<svg viewBox="0 0 100 100"><path d="M10 50 C30 20 70 15 95 40 C75 60 40 75 10 50 Z" fill="currentColor"/><path d="M45 25 L60 5 L65 30 Z" fill="currentColor"/><circle cx="80" cy="38" r="4" fill="#fff"/></svg>`
];

export class BarcodeEngine {
  /**
   * JANコード文字列からハッシュ値を計算
   */
  static hashBarcode(codeStr) {
    let cleaned = codeStr.replace(/\D/g, '');
    if (cleaned.length < 8) {
      // 補長
      cleaned = cleaned.padStart(13, '0');
    }
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      const charCode = cleaned.charCodeAt(i);
      hash = ((hash << 5) - hash) + charCode;
      hash |= 0; // 32bit int
    }
    return Math.abs(hash);
  }

  /**
   * JANコードからキャラクターまたはアイテムを生成（決定論的）
   */
  static generateFromBarcode(codeStr, customMemo = "") {
    const cleaned = codeStr.replace(/\D/g, '') || "4901234567890";
    const digits = cleaned.split('').map(Number);

    // 13桁に満たない場合のデフォルト補完
    while (digits.length < 13) {
      digits.push(0);
    }

    const hash = this.hashBarcode(cleaned);

    // ドロップタイプ判定（約20%の確率、またはハッシュ条件で強化アイテムカード）
    const isItemCard = (hash % 5 === 0);

    if (isItemCard) {
      return this._generateItemCard(cleaned, hash, customMemo);
    }

    // 各桁から決定論的ステータス計算
    const d1 = digits[0] || 4, d2 = digits[1] || 9, d3 = digits[2] || 0;
    const d4 = digits[3] || 1, d5 = digits[4] || 2, d6 = digits[5] || 3;
    const d7 = digits[6] || 4, d8 = digits[7] || 5, d9 = digits[8] || 6;
    const d10 = digits[9] || 7, d11 = digits[10] || 8, d12 = digits[11] || 9;
    const d13 = digits[12] || 0;

    // ステータス
    const hp = 1000 + (d10 * 100) + (d11 * 10); // 1000 ~ 1990
    const atk = 100 + (d8 * 20) + d9;           // 100 ~ 289
    const def = 50 + (d6 * 10) + d7;             // 50 ~ 149
    const spd = 10 + (d4 * 5) + d5;              // 10 ~ 105

    // 属性 (0:火, 1:水, 2:木)
    const elementIndex = d13 % 3;
    const elements = ["火", "水", "木"];
    const element = elements[elementIndex];

    // レアリティ判定
    const rarityVal = d1 * d2 * d3;
    let rarity = "N";
    if (rarityVal >= 250) rarity = "SSR";
    else if (rarityVal >= 120) rarity = "SR";
    else if (rarityVal >= 40) rarity = "R";

    // 名前組み合わせ生成
    const prefixIdx = (hash + d1 + d2) % PREFIXES.length;
    const baseIdx = (hash + d3 + d4) % BASE_NAMES.length;
    const suffixIdx = (hash + d5 + d6) % SUFFIXES.length;
    const name = `${PREFIXES[prefixIdx]}${BASE_NAMES[baseIdx]}${SUFFIXES[suffixIdx]}`;

    // グラフィック選択
    const spriteIdx = hash % MONSTER_SILHOUETTES.length;
    const svgTemplate = MONSTER_SILHOUETTES[spriteIdx];

    // 固有スキル
    const skills = [
      { name: "ギガブレイク", desc: "敵単体に強力な属性ダメージ！" },
      { name: "ハイパーガード", desc: "自分のDEFを2倍にしHP回復！" },
      { name: "ハヤテづき", desc: "先制で連続ダメージをあたえる！" },
      { name: "バーニングバースト", desc: "大爆発を起こし大ダメージ！" }
    ];
    const skill = skills[hash % skills.length];

    return {
      id: `char_${cleaned}_${hash}`,
      barcode: cleaned,
      type: "character",
      name: name,
      element: element,
      rarity: rarity,
      hp: hp,
      maxHp: hp,
      atk: atk,
      def: def,
      spd: spd,
      skill: skill,
      spriteSvg: svgTemplate,
      memo: customMemo || "",
      createdAt: new Date().toISOString()
    };
  }

  static _generateItemCard(cleaned, hash, customMemo) {
    const itemTypes = [
      { name: "やくそうカード", type: "heal", value: 300, desc: "HPを 300 かいふく！" },
      { name: "パワーエナジー", type: "buff_atk", value: 50, desc: "ATKを +50 アップ！" },
      { name: "プロテクトシールド", type: "buff_def", value: 40, desc: "DEFを +40 アップ！" },
      { name: "スピードブーツ", type: "buff_spd", value: 30, desc: "SPDを +30 アップ！" }
    ];
    const item = itemTypes[hash % itemTypes.length];
    return {
      id: `item_${cleaned}_${hash}`,
      barcode: cleaned,
      type: "item",
      name: item.name,
      effectType: item.type,
      value: item.value,
      desc: item.desc,
      rarity: "R",
      memo: customMemo || "バーコードアイテム",
      createdAt: new Date().toISOString()
    };
  }
}
