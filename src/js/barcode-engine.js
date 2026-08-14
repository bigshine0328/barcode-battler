/**
 * Barcode Battler - Barcode Engine Module (v2.4.0 Multi-Element Color & Ultra SSR Background)
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

export const ELEMENT_PALETTES = {
  "火": {
    primary: "#ff2200",
    secondary: "#ffd700",
    dark: "#880011",
    eye: "#ffff00",
    pupil: "#000000",
    accent: "#ff6600",
    glowStart: "#ffe600",
    glowMid: "#ff5500",
    glowEnd: "#ff0044"
  },
  "水": {
    primary: "#0088ff",
    secondary: "#e0ffff",
    dark: "#002266",
    eye: "#00ffff",
    pupil: "#ffffff",
    accent: "#00e5ff",
    glowStart: "#00f0ff",
    glowMid: "#0066ff",
    glowEnd: "#7b00ff"
  },
  "木": {
    primary: "#00aa44",
    secondary: "#aaffaa",
    dark: "#003311",
    eye: "#ffff33",
    pupil: "#003300",
    accent: "#00ff88",
    glowStart: "#aaff44",
    glowMid: "#00ff88",
    glowEnd: "#004422"
  }
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

  static generateCharacterSvg(species, element = "火", rarity = "N") {
    const pal = ELEMENT_PALETTES[element] || ELEMENT_PALETTES["火"];
    const idSuffix = `${Math.floor(Math.random() * 100000)}`;

    let bgDefs = "";
    let bgSvg = "";

    // レアリティ別背景演出
    if (rarity === "SSR") {
      bgDefs = `
        <radialGradient id="ssr-glow-${idSuffix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${pal.glowStart}" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#ffd700" stop-opacity="0.8"/>
          <stop offset="70%" stop-color="${pal.glowMid}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${pal.glowEnd}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="gold-beam-${idSuffix}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#ffe600"/>
          <stop offset="100%" stop-color="#ff7700"/>
        </linearGradient>
      `;
      bgSvg = `
        <!-- 超ド派手 SSR サンバースト & 黄金魔方陣 -->
        <circle cx="70" cy="70" r="66" fill="url(#ssr-glow-${idSuffix})"/>
        <polygon points="70,4 74,48 116,24 88,58 136,70 88,82 116,116 74,92 70,136 66,92 24,116 52,82 4,70 52,58 24,24 66,48" fill="url(#gold-beam-${idSuffix})" opacity="0.65"/>
        <polygon points="70,16 73,54 108,32 82,62 124,70 82,78 108,108 73,86 70,124 67,86 32,108 58,78 16,70 58,62 32,32 67,54" fill="#ffffff" opacity="0.45"/>
        <circle cx="70" cy="70" r="54" stroke="#ffd700" stroke-width="2" fill="none" opacity="0.85"/>
        <circle cx="70" cy="70" r="48" stroke="#ffe600" stroke-width="1.5" stroke-dasharray="6,4" fill="none" opacity="0.9"/>
        <circle cx="70" cy="70" r="42" stroke="${pal.accent}" stroke-width="1" stroke-dasharray="3,3" fill="none" opacity="0.75"/>
        <polygon points="28,28 32,38 42,42 32,46 28,56 24,46 14,42 24,38" fill="#ffffff"/>
        <polygon points="112,24 115,31 122,34 115,37 112,44 109,37 102,34 109,31" fill="#ffffff"/>
        <polygon points="22,104 24,109 29,111 24,113 22,118 20,113 15,111 20,109" fill="#ffe600"/>
        <polygon points="118,98 121,104 127,107 121,110 118,116 115,110 109,107 115,104" fill="#ffe600"/>
        <circle cx="38" cy="85" r="2.5" fill="#ffffff"/>
        <circle cx="102" cy="55" r="2" fill="#ffffff"/>
        <circle cx="70" cy="18" r="3" fill="#ffffff"/>
      `;
    } else if (rarity === "SR") {
      bgDefs = `
        <radialGradient id="sr-glow-${idSuffix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#b066ff" stop-opacity="0.65"/>
          <stop offset="60%" stop-color="${pal.glowMid}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      `;
      bgSvg = `
        <!-- SR サイバーオーラ & ヘックスグリッド -->
        <circle cx="70" cy="70" r="60" fill="url(#sr-glow-${idSuffix})"/>
        <polygon points="70,15 115,40 115,100 70,125 25,100 25,40" stroke="#b066ff" stroke-width="2" fill="none" opacity="0.75"/>
        <circle cx="70" cy="70" r="48" stroke="${pal.accent}" stroke-width="1.5" stroke-dasharray="6,4" fill="none" opacity="0.8"/>
        <polygon points="30,30 33,37 40,39 33,41 30,48 27,41 20,39 27,37" fill="#ffffff"/>
        <polygon points="110,30 113,37 120,39 113,41 110,48 107,41 100,39 107,37" fill="#ffffff"/>
      `;
    } else if (rarity === "R") {
      bgDefs = `
        <radialGradient id="r-glow-${idSuffix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${pal.glowStart}" stop-opacity="0.45"/>
          <stop offset="70%" stop-color="${pal.glowMid}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      `;
      bgSvg = `
        <!-- R クリスタルリング & エナジー粒子 -->
        <circle cx="70" cy="70" r="56" fill="url(#r-glow-${idSuffix})"/>
        <circle cx="70" cy="70" r="54" stroke="${pal.accent}" stroke-width="2" stroke-dasharray="8,6" fill="none" opacity="0.85"/>
        <circle cx="35" cy="40" r="2.5" fill="#ffffff"/>
        <circle cx="105" cy="40" r="2.5" fill="#ffffff"/>
      `;
    } else {
      bgSvg = `
        <!-- N シンプルサークルベース -->
        <circle cx="70" cy="70" r="54" fill="#14182a" stroke="#2e3656" stroke-width="2"/>
      `;
    }

    // 種族別ボディ描画
    let bodySvg = "";
    switch (species) {
      case "ドラゴン":
        bodySvg = `
          <path d="M70 30 Q85 45 100 35 Q95 55 110 60 Q90 75 95 100 Q70 90 45 100 Q50 75 30 60 Q45 55 40 35 Q55 45 70 30 Z" fill="${pal.primary}"/>
          <path d="M55 50 L65 45 L60 60 Z" fill="${pal.secondary}"/>
          <path d="M85 50 L75 45 L80 60 Z" fill="${pal.secondary}"/>
          <circle cx="58" cy="55" r="4.5" fill="${pal.eye}"/>
          <circle cx="82" cy="55" r="4.5" fill="${pal.eye}"/>
          <circle cx="58" cy="55" r="1.8" fill="${pal.pupil}"/>
          <circle cx="82" cy="55" r="1.8" fill="${pal.pupil}"/>
        `;
        break;
      case "ゴーレム":
        bodySvg = `
          <rect x="40" y="32" width="60" height="46" rx="8" fill="${pal.primary}"/>
          <rect x="30" y="42" width="18" height="50" rx="6" fill="${pal.dark}"/>
          <rect x="92" y="42" width="18" height="50" rx="6" fill="${pal.dark}"/>
          <rect x="45" y="78" width="20" height="35" rx="5" fill="${pal.dark}"/>
          <rect x="75" y="78" width="20" height="35" rx="5" fill="${pal.dark}"/>
          <rect x="50" y="45" width="40" height="12" fill="#000000"/>
          <circle cx="60" cy="51" r="4" fill="${pal.eye}"/>
          <circle cx="80" cy="51" r="4" fill="${pal.eye}"/>
        `;
        break;
      case "ナイト":
        bodySvg = `
          <path d="M70 24 L98 42 L98 70 Q98 102 70 114 Q42 102 42 70 L42 42 Z" fill="${pal.primary}"/>
          <rect x="52" y="50" width="36" height="10" rx="3" fill="${pal.secondary}"/>
          <line x1="70" y1="36" x2="70" y2="102" stroke="${pal.secondary}" stroke-width="4"/>
          <path d="M98 58 L118 36 L108 80 Z" fill="${pal.dark}"/>
        `;
        break;
      case "フェニックス":
        bodySvg = `
          <path d="M70 24 C48 38 26 28 18 55 C38 57 48 72 62 94 C65 104 70 114 70 114 C70 114 75 104 78 94 C92 72 102 57 122 55 C114 28 92 38 70 24 Z" fill="${pal.primary}"/>
          <path d="M65 38 Q70 16 75 38" stroke="${pal.secondary}" stroke-width="4" fill="none"/>
          <circle cx="63" cy="41" r="3.5" fill="${pal.eye}"/>
          <circle cx="77" cy="41" r="3.5" fill="${pal.eye}"/>
        `;
        break;
      case "タイガー":
        bodySvg = `
          <path d="M38 38 L58 50 L70 34 L82 50 L102 38 L96 76 L106 108 L34 108 L44 76 Z" fill="${pal.primary}"/>
          <path d="M48 60 L60 65 L48 70" fill="none" stroke="${pal.secondary}" stroke-width="3"/>
          <path d="M92 60 L80 65 L92 70" fill="none" stroke="${pal.secondary}" stroke-width="3"/>
          <circle cx="56" cy="60" r="4" fill="${pal.eye}"/>
          <circle cx="84" cy="60" r="4" fill="${pal.eye}"/>
        `;
        break;
      case "スライム":
        bodySvg = `
          <path d="M70 32 C38 32 26 70 26 92 C26 112 48 116 70 116 C92 116 114 112 114 92 C114 70 102 32 70 32 Z" fill="${pal.primary}"/>
          <circle cx="53" cy="70" r="8" fill="#ffffff"/>
          <circle cx="87" cy="70" r="8" fill="#ffffff"/>
          <circle cx="55" cy="70" r="4" fill="${pal.pupil}"/>
          <circle cx="89" cy="70" r="4" fill="${pal.pupil}"/>
          <path d="M58 92 Q70 104 82 92" stroke="${pal.secondary}" stroke-width="3.5" fill="none"/>
        `;
        break;
      case "ベア":
        bodySvg = `
          <circle cx="42" cy="42" r="16" fill="${pal.dark}"/>
          <circle cx="98" cy="42" r="16" fill="${pal.dark}"/>
          <path d="M36 58 Q70 42 104 58 L110 108 C110 108 70 118 30 108 Z" fill="${pal.primary}"/>
          <ellipse cx="70" cy="86" rx="20" ry="14" fill="${pal.secondary}"/>
          <circle cx="70" cy="80" r="6" fill="#000000"/>
          <circle cx="56" cy="68" r="4.5" fill="${pal.eye}"/>
          <circle cx="84" cy="68" r="4.5" fill="${pal.eye}"/>
        `;
        break;
      case "ロボ":
        bodySvg = `
          <rect x="42" y="38" width="56" height="50" rx="6" fill="${pal.primary}"/>
          <line x1="70" y1="20" x2="70" y2="38" stroke="${pal.secondary}" stroke-width="4"/>
          <circle cx="70" cy="20" r="6" fill="${pal.accent}"/>
          <rect x="50" y="50" width="40" height="14" fill="#000000"/>
          <circle cx="60" cy="57" r="4.5" fill="${pal.eye}"/>
          <circle cx="80" cy="57" r="4.5" fill="${pal.eye}"/>
          <rect x="36" y="94" width="68" height="24" rx="4" fill="${pal.dark}"/>
        `;
        break;
      case "ウルフ":
        bodySvg = `
          <path d="M70 26 L90 52 L114 58 L92 84 L100 114 L70 98 L40 114 L48 84 L26 58 L50 52 Z" fill="${pal.primary}"/>
          <polygon points="70,64 60,82 80,82" fill="${pal.secondary}"/>
          <circle cx="57" cy="58" r="4.5" fill="${pal.eye}"/>
          <circle cx="83" cy="58" r="4.5" fill="${pal.eye}"/>
        `;
        break;
      case "ライオン":
        bodySvg = `
          <circle cx="70" cy="70" r="44" fill="${pal.dark}"/>
          <path d="M48 48 Q70 26 92 48 Q114 70 92 92 Q70 114 48 92 Q26 70 48 48 Z" fill="${pal.accent}"/>
          <circle cx="70" cy="72" r="24" fill="${pal.primary}"/>
          <circle cx="59" cy="65" r="4.5" fill="${pal.eye}"/>
          <circle cx="81" cy="65" r="4.5" fill="${pal.eye}"/>
          <polygon points="70,76 64,85 76,85" fill="${pal.secondary}"/>
        `;
        break;
      case "イエティ":
        bodySvg = `
          <path d="M70 26 C38 36 32 70 32 112 L108 112 C108 70 102 36 70 26 Z" fill="${pal.primary}"/>
          <ellipse cx="70" cy="62" rx="28" ry="20" fill="#000000"/>
          <circle cx="58" cy="60" r="5" fill="${pal.eye}"/>
          <circle cx="82" cy="60" r="5" fill="${pal.eye}"/>
          <polygon points="64,74 70,68 76,74" fill="${pal.secondary}"/>
        `;
        break;
      case "グリフォン":
        bodySvg = `
          <path d="M70 26 L92 48 L118 42 L102 76 L112 112 L70 98 L28 112 L38 76 L22 42 L48 48 Z" fill="${pal.primary}"/>
          <path d="M70 48 L86 70 L54 70 Z" fill="${pal.secondary}"/>
          <circle cx="59" cy="50" r="4.5" fill="${pal.eye}"/>
          <circle cx="81" cy="50" r="4.5" fill="${pal.eye}"/>
        `;
        break;
      case "バトロボ":
        bodySvg = `
          <polygon points="48,26 92,26 108,60 98,114 42,114 32,60" fill="${pal.primary}"/>
          <rect x="42" y="48" width="56" height="18" fill="#000000"/>
          <circle cx="56" cy="57" r="5" fill="${pal.eye}"/>
          <circle cx="84" cy="57" r="5" fill="${pal.eye}"/>
          <rect x="25" y="65" width="14" height="38" rx="3" fill="${pal.secondary}"/>
          <rect x="101" y="65" width="14" height="38" rx="3" fill="${pal.secondary}"/>
        `;
        break;
      case "クラーケン":
        bodySvg = `
          <circle cx="70" cy="50" r="30" fill="${pal.primary}"/>
          <path d="M42 72 Q25 94 36 116 M57 78 Q48 100 53 116 M70 80 Q70 102 70 116 M83 78 Q92 100 87 116 M98 72 Q115 94 104 116" stroke="${pal.accent}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
          <circle cx="57" cy="47" r="5.5" fill="${pal.eye}"/>
          <circle cx="83" cy="47" r="5.5" fill="${pal.eye}"/>
          <circle cx="57" cy="47" r="2.5" fill="${pal.pupil}"/>
          <circle cx="83" cy="47" r="2.5" fill="${pal.pupil}"/>
        `;
        break;
      case "ペガサス":
        bodySvg = `
          <path d="M70 30 Q52 42 42 70 Q42 102 64 108 Q86 102 98 70 Q88 42 70 30 Z" fill="${pal.primary}"/>
          <path d="M42 52 Q18 35 18 64 Q36 70 48 76" fill="${pal.secondary}"/>
          <path d="M98 52 Q122 35 122 64 Q104 70 92 76" fill="${pal.secondary}"/>
          <polygon points="70,18 64,34 76,34" fill="${pal.secondary}"/>
          <circle cx="58" cy="58" r="4.5" fill="${pal.eye}"/>
          <circle cx="82" cy="58" r="4.5" fill="${pal.eye}"/>
        `;
        break;
      case "キマイラ":
        bodySvg = `
          <circle cx="48" cy="48" r="20" fill="${pal.dark}"/>
          <circle cx="92" cy="48" r="20" fill="${pal.dark}"/>
          <circle cx="70" cy="86" r="26" fill="${pal.primary}"/>
          <path d="M36 92 Q70 120 104 92" fill="${pal.accent}"/>
          <circle cx="45" cy="45" r="4" fill="${pal.eye}"/>
          <circle cx="95" cy="45" r="4" fill="${pal.eye}"/>
          <circle cx="70" cy="83" r="5" fill="${pal.secondary}"/>
        `;
        break;
      case "デーモン":
        bodySvg = `
          <path d="M70 35 Q90 25 100 20 Q95 45 100 65 Q85 100 70 105 Q55 100 40 65 Q45 45 40 20 Q50 25 70 35 Z" fill="${pal.dark}"/>
          <polygon points="40,20 50,37 35,40" fill="${pal.secondary}"/>
          <polygon points="100,20 90,37 105,40" fill="${pal.secondary}"/>
          <circle cx="56" cy="57" r="5.5" fill="${pal.primary}"/>
          <circle cx="84" cy="57" r="5.5" fill="${pal.primary}"/>
          <circle cx="56" cy="57" r="2.5" fill="${pal.eye}"/>
          <circle cx="84" cy="57" r="2.5" fill="${pal.eye}"/>
          <path d="M58 84 Q70 96 82 84" stroke="${pal.secondary}" stroke-width="3.5" fill="none"/>
        `;
        break;
      case "レヴィアタン":
        bodySvg = `
          <path d="M30 100 Q48 35 70 70 Q92 105 108 35 Q118 80 92 108 Q64 80 46 112 Z" fill="${pal.primary}"/>
          <circle cx="102" cy="42" r="5" fill="${pal.eye}"/>
          <polygon points="96,30 108,24 114,36" fill="${pal.secondary}"/>
        `;
        break;
      case "ネクロマンサー":
        bodySvg = `
          <path d="M70 26 Q104 38 98 94 L42 94 Q36 38 70 26 Z" fill="${pal.dark}"/>
          <circle cx="70" cy="60" r="20" fill="#000000"/>
          <circle cx="61" cy="58" r="4.5" fill="${pal.eye}"/>
          <circle cx="79" cy="58" r="4.5" fill="${pal.eye}"/>
          <path d="M58 94 L70 120 L82 94 Z" fill="${pal.primary}"/>
        `;
        break;
      case "ファントム":
      default:
        bodySvg = `
          <path d="M70 26 C42 26 36 60 36 88 Q42 104 54 94 Q65 109 70 94 Q76 109 86 94 Q98 104 104 88 C104 60 98 26 70 26 Z" fill="${pal.primary}"/>
          <ellipse cx="57" cy="58" rx="6" ry="9" fill="#000000"/>
          <ellipse cx="83" cy="58" rx="6" ry="9" fill="#000000"/>
          <circle cx="57" cy="56" r="3" fill="${pal.eye}"/>
          <circle cx="83" cy="56" r="3" fill="${pal.eye}"/>
        `;
        break;
    }

    return `
      <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
        <defs>${bgDefs}</defs>
        ${bgSvg}
        ${bodySvg}
      </svg>
    `.trim();
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
    const spriteSvg = this.generateCharacterSvg(baseSpeciesName, element, rarity);

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
