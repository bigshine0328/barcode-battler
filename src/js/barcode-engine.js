/**
 * Barcode Battler - Barcode Engine Module (v2.3.0 20 Species & New Rarity)
 */

export const PREFIXES = [
  "ばくえんの", "そうかいの", "しっぷうの", "でんせつの", "すーぱー",
  "はらぺこ", "むてきの", "きらめく", "あくまの", "てんしの",
  "ごうけんの", "しんぴの", "いかずちの", "ふぶきの", "ごうきゅうの",
  "のんびり", "ハイパー", "まぼろしの", "やみのおう", "ひかりの"
];

export const BASE_NAMES = [
  "ドラゴン", "ゴーレム", "ナイト", "フェニックス", "タイガー",
  "スライム", "ベア", "ロボ", "ウルフ", "ライオン",
  "イエティ", "グリフォン", "バトロボ", "クラーケン", "ペガサス",
  "キマイラ", "デーモン", "レヴィアタン", "ネクロマンサー", "ファントム"
];

export const SUFFIXES = [
  "バトラー", "キング", "マスター", "ヒーロー", "ビースト",
  "ガード", "ファイター", "ロード", "カイザー", "エンペラー"
];

export const SPECIES_SVGS = {
  "ドラゴン": `<svg viewBox="0 0 100 100"><path d="M50 10 Q65 25 80 15 Q75 35 90 40 Q70 55 75 80 Q50 70 25 80 Q30 55 10 40 Q25 35 20 15 Q35 25 50 10 Z" fill="currentColor"/><path d="M35 30 L45 25 L40 40 Z" fill="#fff"/><path d="M65 30 L55 25 L60 40 Z" fill="#fff"/><circle cx="38" cy="35" r="4" fill="#ff0055"/><circle cx="62" cy="35" r="4" fill="#ff0055"/></svg>`,
  "ゴーレム": `<svg viewBox="0 0 100 100"><rect x="20" y="15" width="60" height="45" rx="8" fill="currentColor"/><rect x="10" y="25" width="18" height="50" rx="6" fill="currentColor"/><rect x="72" y="25" width="18" height="50" rx="6" fill="currentColor"/><rect x="25" y="60" width="20" height="35" rx="5" fill="currentColor"/><rect x="55" y="60" width="20" height="35" rx="5" fill="currentColor"/><rect x="30" y="28" width="40" height="12" fill="#000"/><circle cx="40" cy="34" r="4" fill="#00e5ff"/><circle cx="60" cy="34" r="4" fill="#00e5ff"/></svg>`,
  "ナイト": `<svg viewBox="0 0 100 100"><path d="M50 8 L75 25 L75 50 Q75 80 50 92 Q25 80 25 50 L25 25 Z" fill="currentColor"/><rect x="35" y="32" width="30" height="8" rx="3" fill="#fff"/><line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="4"/><path d="M75 40 L95 20 L85 60 Z" fill="currentColor"/></svg>`,
  "フェニックス": `<svg viewBox="0 0 100 100"><path d="M50 12 C30 25 10 15 2 40 C20 42 30 55 42 75 C45 85 50 95 50 95 C50 95 55 85 58 75 C70 55 80 42 98 40 C90 15 70 25 50 12 Z" fill="currentColor"/><path d="M45 25 Q50 5 55 25" stroke="#fff" stroke-width="3" fill="none"/><circle cx="43" cy="28" r="3" fill="#fff"/><circle cx="57" cy="28" r="3" fill="#fff"/></svg>`,
  "タイガー": `<svg viewBox="0 0 100 100"><path d="M20 20 L38 32 L50 18 L62 32 L80 20 L75 55 L85 85 L15 85 L25 55 Z" fill="currentColor"/><path d="M30 40 L40 45 L30 50" fill="none" stroke="#fff" stroke-width="3"/><path d="M70 40 L60 45 L70 50" fill="none" stroke="#fff" stroke-width="3"/><circle cx="36" cy="42" r="4" fill="#fff"/><circle cx="64" cy="42" r="4" fill="#fff"/></svg>`,
  "スライム": `<svg viewBox="0 0 100 100"><path d="M50 15 C20 15 10 50 10 70 C10 88 30 92 50 92 C70 92 90 88 90 70 C90 50 80 15 50 15 Z" fill="currentColor"/><circle cx="35" cy="50" r="7" fill="#fff"/><circle cx="65" cy="50" r="7" fill="#fff"/><circle cx="37" cy="50" r="3" fill="#000"/><circle cx="67" cy="50" r="3" fill="#000"/><path d="M40 70 Q50 80 60 70" stroke="#fff" stroke-width="3" fill="none"/></svg>`,
  "ベア": `<svg viewBox="0 0 100 100"><circle cx="25" cy="25" r="15" fill="currentColor"/><circle cx="75" cy="25" r="15" fill="currentColor"/><path d="M20 40 Q50 25 80 40 L85 85 C85 85 50 95 15 85 Z" fill="currentColor"/><ellipse cx="50" cy="65" rx="18" ry="12" fill="#fff"/><circle cx="50" cy="60" r="5" fill="#000"/><circle cx="38" cy="48" r="4" fill="#fff"/><circle cx="62" cy="48" r="4" fill="#fff"/></svg>`,
  "ロボ": `<svg viewBox="0 0 100 100"><rect x="25" y="20" width="50" height="45" rx="5" fill="currentColor"/><line x1="50" y1="5" x2="50" y2="20" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="5" r="6" fill="#ff0055"/><rect x="32" y="32" width="36" height="12" fill="#000"/><circle cx="42" cy="38" r="4" fill="#00e5ff"/><circle cx="58" cy="38" r="4" fill="#00e5ff"/><rect x="20" y="70" width="60" height="22" rx="4" fill="currentColor"/></svg>`,
  "ウルフ": `<svg viewBox="0 0 100 100"><path d="M50 10 L68 35 L90 40 L70 65 L78 92 L50 78 L22 92 L30 65 L10 40 L32 35 Z" fill="currentColor"/><polygon points="50,45 42,60 58,60" fill="#fff"/><circle cx="38" cy="40" r="4" fill="#ffea00"/><circle cx="62" cy="40" r="4" fill="#ffea00"/></svg>`,
  "ライオン": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="currentColor"/><path d="M30 30 Q50 10 70 30 Q90 50 70 70 Q50 90 30 70 Q10 50 30 30 Z" fill="#ff9900"/><circle cx="50" cy="52" r="22" fill="currentColor"/><circle cx="40" cy="45" r="4" fill="#fff"/><circle cx="60" cy="45" r="4" fill="#fff"/><polygon points="50,55 45,63 55,63" fill="#fff"/></svg>`,
  "イエティ": `<svg viewBox="0 0 100 100"><path d="M50 10 C20 20 15 50 15 88 L85 88 C85 50 80 20 50 10 Z" fill="currentColor"/><ellipse cx="50" cy="42" rx="25" ry="18" fill="#000"/><circle cx="40" cy="40" r="5" fill="#00e5ff"/><circle cx="60" cy="40" r="5" fill="#00e5ff"/><polygon points="45,52 50,47 55,52" fill="#fff"/></svg>`,
  "グリフォン": `<svg viewBox="0 0 100 100"><path d="M50 10 L70 30 L95 25 L80 55 L90 88 L50 75 L10 88 L20 55 L5 25 L30 30 Z" fill="currentColor"/><path d="M50 30 L65 50 L35 50 Z" fill="#fff"/><circle cx="40" cy="32" r="4" fill="#ff0055"/><circle cx="60" cy="32" r="4" fill="#ff0055"/></svg>`,
  "バトロボ": `<svg viewBox="0 0 100 100"><polygon points="30,10 70,10 85,40 75,90 25,90 15,40" fill="currentColor"/><rect x="25" y="30" width="50" height="15" fill="#000"/><circle cx="38" cy="37" r="5" fill="#ff0055"/><circle cx="62" cy="37" r="5" fill="#ff0055"/><rect x="10" y="45" width="12" height="35" rx="3" fill="#ffea00"/><rect x="78" y="45" width="12" height="35" rx="3" fill="#ffea00"/></svg>`,
  "クラーケン": `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="28" fill="currentColor"/><path d="M25 55 Q10 75 20 95 M38 60 Q30 80 35 95 M50 62 Q50 82 50 95 M62 60 Q70 80 65 95 M75 55 Q90 75 80 95" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="38" cy="32" r="5" fill="#ffea00"/><circle cx="62" cy="32" r="5" fill="#ffea00"/><circle cx="38" cy="32" r="2" fill="#000"/><circle cx="62" cy="32" r="2" fill="#000"/></svg>`,
  "ペガサス": `<svg viewBox="0 0 100 100"><path d="M50 15 Q35 25 25 50 Q25 80 45 85 Q65 80 75 50 Q65 25 50 15 Z" fill="currentColor"/><path d="M25 35 Q5 20 5 45 Q20 50 30 55" fill="#fff"/><path d="M75 35 Q95 20 95 45 Q80 50 70 55" fill="#fff"/><polygon points="50,5 45,20 55,20" fill="#ffea00"/><circle cx="40" cy="40" r="4" fill="#00e5ff"/><circle cx="60" cy="40" r="4" fill="#00e5ff"/></svg>`,
  "キマイラ": `<svg viewBox="0 0 100 100"><circle cx="30" cy="30" r="18" fill="currentColor"/><circle cx="70" cy="30" r="18" fill="currentColor"/><circle cx="50" cy="65" r="24" fill="currentColor"/><path d="M20 70 Q50 95 80 70" fill="currentColor"/><circle cx="28" cy="28" r="3" fill="#ff0055"/><circle cx="72" cy="28" r="3" fill="#ffea00"/><circle cx="50" cy="62" r="4" fill="#00e5ff"/></svg>`,
  "デーモン": `<svg viewBox="0 0 100 100"><path d="M50 20 Q70 10 80 5 Q75 30 80 50 Q65 85 50 90 Q35 85 20 50 Q25 30 20 5 Q30 10 50 20 Z" fill="currentColor"/><polygon points="20,5 30,22 15,25" fill="#ff0055"/><polygon points="80,5 70,22 85,25" fill="#ff0055"/><circle cx="36" cy="42" r="5" fill="#ffea00"/><circle cx="64" cy="42" r="5" fill="#ffea00"/><path d="M40 68 Q50 80 60 68" stroke="#fff" stroke-width="3" fill="none"/></svg>`,
  "レヴィアタン": `<svg viewBox="0 0 100 100"><path d="M15 80 Q30 20 50 50 Q70 80 85 20 Q95 60 70 85 Q45 60 30 90 Z" fill="currentColor"/><circle cx="80" cy="25" r="4" fill="#ff0055"/><polygon points="75,15 85,10 90,20" fill="#00e5ff"/></svg>`,
  "ネクロマンサー": `<svg viewBox="0 0 100 100"><path d="M50 10 Q80 20 75 70 L25 70 Q20 20 50 10 Z" fill="currentColor"/><circle cx="50" cy="42" r="18" fill="#000"/><circle cx="42" cy="40" r="4" fill="#00e5ff"/><circle cx="58" cy="40" r="4" fill="#00e5ff"/><path d="M40 70 L50 95 L60 70 Z" fill="currentColor"/></svg>`,
  "ファントム": `<svg viewBox="0 0 100 100"><path d="M50 10 C25 10 20 40 20 65 Q25 80 35 70 Q45 85 50 70 Q55 85 65 70 Q75 80 80 65 C80 40 75 10 50 10 Z" fill="currentColor"/><ellipse cx="38" cy="38" rx="5" ry="8" fill="#000"/><ellipse cx="62" cy="38" rx="5" ry="8" fill="#000"/><circle cx="38" cy="36" r="2" fill="#00e5ff"/><circle cx="62" cy="36" r="2" fill="#00e5ff"/></svg>`
};

export class BarcodeEngine {
  static hashBarcode(codeStr) {
    let cleaned = (codeStr || "4901234567890").replace(/\D/g, '') || "4901234567890";
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = ((hash << 5) - hash) + cleaned.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  static getRandomBarcode() {
    let code = "49";
    for (let i = 0; i < 11; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  static generateFromBarcode(codeStr, customMemo = "") {
    const cleaned = (codeStr || "4901234567890").replace(/\D/g, '') || "4901234567890";
    const digits = cleaned.split('').map(Number);
    while (digits.length < 13) digits.push(0);

    const hash = this.hashBarcode(cleaned);
    const isItemCard = (hash % 5 === 0);

    const rarityScore = (hash % 100);
    let rarity = "N";
    let charMult = 1.0;
    let itemMult = 1.0;

    if (rarityScore < 3) {
      rarity = "SSR";
      charMult = 1.60;
      itemMult = 2.50;
    } else if (rarityScore < 15) {
      rarity = "SR";
      charMult = 1.35;
      itemMult = 1.70;
    } else if (rarityScore < 40) {
      rarity = "R";
      charMult = 1.15;
      itemMult = 1.25;
    } else {
      rarity = "N";
      charMult = 1.00;
      itemMult = 1.00;
    }

    if (isItemCard) {
      const baseItemTypes = [
        { name: "えりくさー", type: "heal", baseVal: 300, getDesc: (v) => `HPを ${v} かいふく！` },
        { name: "はかいのつるぎ", type: "buff_atk", baseVal: 60, getDesc: (v) => `ATKを +${v} アップ！` },
        { name: "いあつのたて", type: "buff_def", baseVal: 50, getDesc: (v) => `DEFを +${v} アップ！` },
        { name: "ひかりのたびびと", type: "buff_spd", baseVal: 40, getDesc: (v) => `SPDを +${v} アップ！` },
        { name: "びくとりーのたま", type: "charge_sp", baseVal: 100, getDesc: () => `SPを 即座に 100% ためる！` },
        { name: "まほうのばくだん", type: "bomb", baseVal: 200, getDesc: (v) => `相手に ${v} の固定ダメージ！` },
        { name: "ふ死鳥の水", type: "heal_def", baseVal: 200, getDesc: (v) => `HPを ${v} かいふく & DEFアップ！` },
        { name: "おうかんの輝き", type: "all_buff", baseVal: 30, getDesc: (v) => `ATK/DEF/SPD を +${v} アップ！` }
      ];

      const itemBase = baseItemTypes[hash % baseItemTypes.length];
      const finalValue = Math.round(itemBase.baseVal * itemMult);

      return {
        id: `item_${cleaned}_${hash}`,
        barcode: cleaned,
        type: "item",
        name: `${rarity === 'SSR' ? '✨ [SSR] ' : rarity === 'SR' ? '🌟 [SR] ' : ''}${itemBase.name}`,
        effectType: itemBase.type,
        value: finalValue,
        desc: itemBase.getDesc(finalValue),
        rarity: rarity,
        memo: customMemo || "バーコードアイテム",
        createdAt: new Date().toISOString()
      };
    }

    const baseHp = 900 + ((digits[9] || 7) * 80) + ((digits[10] || 8) * 10);
    const baseAtk = 90 + ((digits[7] || 5) * 15) + (digits[8] || 6);
    const baseDef = 40 + ((digits[5] || 3) * 8) + (digits[6] || 4);
    const baseSpd = 10 + ((digits[3] || 1) * 4) + (digits[4] || 2);

    const hp = Math.round(baseHp * charMult);
    const atk = Math.round(baseAtk * charMult);
    const def = Math.round(baseDef * charMult);
    const spd = Math.round(baseSpd * charMult);

    const elements = ["火", "水", "木"];
    const element = elements[(digits[12] || 0) % 3];

    const pIdx = hash % PREFIXES.length;
    const bIdx = (hash + 1) % BASE_NAMES.length;
    const sIdx = (hash + 2) % SUFFIXES.length;

    const baseSpeciesName = BASE_NAMES[bIdx];
    const name = `${PREFIXES[pIdx]}${baseSpeciesName}${SUFFIXES[sIdx]}`;
    const spriteSvg = SPECIES_SVGS[baseSpeciesName] || SPECIES_SVGS["ドラゴン"];

    return {
      id: `char_${cleaned}_${hash}`,
      barcode: cleaned,
      type: "character",
      name: name,
      species: baseSpeciesName,
      element: element,
      rarity: rarity,
      hp: hp,
      maxHp: hp,
      atk: atk,
      def: def,
      spd: spd,
      skill: { name: "ギガブレイク", desc: "敵に強力な属性ダメージ！" },
      spriteSvg: spriteSvg,
      memo: customMemo || "",
      createdAt: new Date().toISOString()
    };
  }
}
