/**
 * Barcode Battler - Complete Standalone Bundle (v2.4.1 Horizontal Overflow Fix & Distinct Deck Sets)
 */

(function() {
  'use strict';

  // ==========================================
  // 1. 定数・辞書定義 (20種族 & 属性パレット & レアリティ演出)
  // ==========================================
  const PREFIXES = [
    "ばくえんの", "そうかいの", "しっぷうの", "でんせつの", "すーぱー",
    "はらぺこ", "むてきの", "きらめく", "あくまの", "てんしの",
    "ごうけんの", "しんぴの", "いかずちの", "ふぶきの", "ごうきゅうの",
    "のんびり", "ハイパー", "まぼろしの", "やみのおう", "ひかりの"
  ];

  const BASE_NAMES = [
    "ドラゴン", "ゴーレム", "ナイト", "フェニックス", "タイガー",
    "スライム", "ベア", "ロボ", "ウルフ", "ライオン",
    "イエティ", "グリフォン", "バトロボ", "クラーケン", "ペガサス",
    "キマイラ", "デーモン", "レヴィアタン", "ネクロマンサー", "ファントム"
  ];

  const SUFFIXES = [
    "バトラー", "キング", "マスター", "ヒーロー", "ビースト",
    "ガード", "ファイター", "ロード", "カイザー", "エンペラー"
  ];

  const ELEMENT_PALETTES = {
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

  const ITEM_ICONS = {
    "heal": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#28a745"/><rect x="42" y="20" width="16" height="60" rx="4" fill="#fff"/><rect x="20" y="42" width="60" height="16" rx="4" fill="#fff"/></svg>`,
    "buff_atk": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#dc3545"/><path d="M50 15 L70 50 L58 50 L58 85 L42 85 L42 50 L30 50 Z" fill="#fff"/></svg>`,
    "buff_def": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#007bff"/><path d="M50 15 L80 30 L80 60 Q80 85 50 92 Q20 85 20 60 L20 30 Z" fill="#fff"/></svg>`,
    "buff_spd": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ffc107"/><polygon points="55,10 25,55 50,55 45,90 75,45 50,45" fill="#fff"/></svg>`,
    "charge_sp": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#9b59b6"/><polygon points="50,15 62,38 87,42 68,60 73,85 50,72 27,85 32,60 13,42 38,38" fill="#ffd700"/></svg>`,
    "bomb": `<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="35" fill="#343a40"/><path d="M50 20 L50 10 Q50 5 60 5" stroke="#ffc107" stroke-width="4" fill="none"/><polygon points="60,2 65,7 60,12 55,7" fill="#ff0055"/></svg>`,
    "heal_def": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#17a2b8"/><path d="M50 15 L75 28 L75 55 Q75 78 50 85 Q25 78 25 55 L25 28 Z" fill="#fff"/><rect x="44" y="35" width="12" height="30" fill="#28a745"/><rect x="35" y="44" width="30" height="12" fill="#28a745"/></svg>`,
    "all_buff": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#fd7e14"/><polygon points="50,15 60,35 85,25 75,55 90,75 65,70 50,90 35,70 10,75 25,55 15,25 40,35" fill="#ffd700"/></svg>`
  };

  function generateCharacterSvg(species, element = "火", rarity = "N") {
    const pal = ELEMENT_PALETTES[element] || ELEMENT_PALETTES["火"];
    const idSuffix = `${Math.floor(Math.random() * 100000)}`;

    let bgDefs = "";
    let bgSvg = "";

    if (rarity === "SSR") {
      bgDefs = `
        <radialGradient id="b-ssr-glow-${idSuffix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${pal.glowStart}" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#ffd700" stop-opacity="0.8"/>
          <stop offset="70%" stop-color="${pal.glowMid}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${pal.glowEnd}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="b-gold-beam-${idSuffix}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#ffe600"/>
          <stop offset="100%" stop-color="#ff7700"/>
        </linearGradient>
      `;
      bgSvg = `
        <circle cx="70" cy="70" r="66" fill="url(#b-ssr-glow-${idSuffix})"/>
        <polygon points="70,4 74,48 116,24 88,58 136,70 88,82 116,116 74,92 70,136 66,92 24,116 52,82 4,70 52,58 24,24 66,48" fill="url(#b-gold-beam-${idSuffix})" opacity="0.65"/>
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
        <radialGradient id="b-sr-glow-${idSuffix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#b066ff" stop-opacity="0.65"/>
          <stop offset="60%" stop-color="${pal.glowMid}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      `;
      bgSvg = `
        <circle cx="70" cy="70" r="60" fill="url(#b-sr-glow-${idSuffix})"/>
        <polygon points="70,15 115,40 115,100 70,125 25,100 25,40" stroke="#b066ff" stroke-width="2" fill="none" opacity="0.75"/>
        <circle cx="70" cy="70" r="48" stroke="${pal.accent}" stroke-width="1.5" stroke-dasharray="6,4" fill="none" opacity="0.8"/>
        <polygon points="30,30 33,37 40,39 33,41 30,48 27,41 20,39 27,37" fill="#ffffff"/>
        <polygon points="110,30 113,37 120,39 113,41 110,48 107,41 100,39 107,37" fill="#ffffff"/>
      `;
    } else if (rarity === "R") {
      bgDefs = `
        <radialGradient id="b-r-glow-${idSuffix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${pal.glowStart}" stop-opacity="0.45"/>
          <stop offset="70%" stop-color="${pal.glowMid}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      `;
      bgSvg = `
        <circle cx="70" cy="70" r="56" fill="url(#b-r-glow-${idSuffix})"/>
        <circle cx="70" cy="70" r="54" stroke="${pal.accent}" stroke-width="2" stroke-dasharray="8,6" fill="none" opacity="0.85"/>
        <circle cx="35" cy="40" r="2.5" fill="#ffffff"/>
        <circle cx="105" cy="40" r="2.5" fill="#ffffff"/>
      `;
    } else {
      bgSvg = `
        <circle cx="70" cy="70" r="54" fill="#14182a" stroke="#2e3656" stroke-width="2"/>
      `;
    }

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

  function getCharacterSpriteSvg(card) {
    if (!card) return generateCharacterSvg("ドラゴン", "火", "N");
    if (card.type === 'item') {
      return ITEM_ICONS[card.effectType] || ITEM_ICONS["heal"];
    }
    const species = card.species || "ドラゴン";
    const element = card.element || "火";
    const rarity = card.rarity || "N";
    return generateCharacterSvg(species, element, rarity);
  }

  // ==========================================
  // 2. Barcode Engine
  // ==========================================
  class BarcodeEngine {
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
      const spriteSvg = generateCharacterSvg(baseSpeciesName, element, rarity);

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

  // ==========================================
  // 3. Storage Manager (3 アイテム対応)
  // ==========================================
  const STORAGE_KEY_COLLECTION = "barcode_battler_collection";
  const STORAGE_KEY_DECK = "barcode_battler_deck";

  class StorageManager {
    static getCollection() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_COLLECTION);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    static migrateCollectionData() {
      try {
        const collection = this.getCollection();
        if (!collection || collection.length === 0) return;

        const updatedCollection = collection.map(card => {
          if (card && card.barcode) {
            const freshCard = BarcodeEngine.generateFromBarcode(card.barcode, card.memo || "");
            freshCard.id = card.id;
            freshCard.createdAt = card.createdAt || new Date().toISOString();
            return freshCard;
          }
          return card;
        });

        localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(updatedCollection));
      } catch (e) {}
    }

    static saveToCollection(card) {
      const collection = this.getCollection();
      const existingIndex = collection.findIndex(c => c.id === card.id);
      if (existingIndex >= 0) {
        collection[existingIndex] = card;
      } else {
        if (collection.length >= 100) {
          collection.shift();
        }
        collection.push(card);
      }
      try {
        localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
      } catch (e) {}
    }

    static deleteFromCollection(cardId) {
      let collection = this.getCollection();
      const target = collection.find(c => c.id === cardId);
      if (!target) return false;

      collection = collection.filter(c => c.id !== cardId);
      try {
        localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
      } catch (e) {}

      const deck = this.getDeck();
      let deckChanged = false;
      if (deck.mainChar && deck.mainChar.id === cardId) { deck.mainChar = null; deckChanged = true; }
      if (deck.subChar1 && deck.subChar1.id === cardId) { deck.subChar1 = null; deckChanged = true; }
      if (deck.subChar2 && deck.subChar2.id === cardId) { deck.subChar2 = null; deckChanged = true; }
      if (deck.itemCard1 && deck.itemCard1.id === cardId) { deck.itemCard1 = null; deckChanged = true; }
      if (deck.itemCard2 && deck.itemCard2.id === cardId) { deck.itemCard2 = null; deckChanged = true; }
      if (deck.itemCard3 && deck.itemCard3.id === cardId) { deck.itemCard3 = null; deckChanged = true; }

      if (deckChanged) {
        try {
          localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(deck));
        } catch (e) {}
      }

      return true;
    }

    static updateMemo(cardId, newMemo) {
      const collection = this.getCollection();
      const target = collection.find(c => c.id === cardId);
      if (target) {
        target.memo = newMemo;
        try {
          localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
        } catch (e) {}
      }
    }

    static getDeck() {
      let deck = {
        mainChar: null,
        subChar1: null,
        subChar2: null,
        itemCard1: null,
        itemCard2: null,
        itemCard3: null
      };
      try {
        const data = localStorage.getItem(STORAGE_KEY_DECK);
        if (data) {
          const parsed = JSON.parse(data);
          deck.mainChar = parsed.mainChar || null;
          deck.subChar1 = parsed.subChar1 || null;
          deck.subChar2 = parsed.subChar2 || null;
          deck.itemCard1 = parsed.itemCard1 || parsed.itemCard || null;
          deck.itemCard2 = parsed.itemCard2 || null;
          deck.itemCard3 = parsed.itemCard3 || null;
        }
      } catch (e) {}

      const collection = this.getCollection();
      const validChars = collection.filter(c => c && c.type === 'character' && typeof c.hp === 'number');
      const validItems = collection.filter(c => c && c.type === 'item');

      if (deck.mainChar && deck.mainChar.type !== 'character') deck.mainChar = null;
      if (deck.subChar1 && deck.subChar1.type !== 'character') deck.subChar1 = null;
      if (deck.subChar2 && deck.subChar2.type !== 'character') deck.subChar2 = null;
      if (deck.itemCard1 && deck.itemCard1.type !== 'item') deck.itemCard1 = null;
      if (deck.itemCard2 && deck.itemCard2.type !== 'item') deck.itemCard2 = null;
      if (deck.itemCard3 && deck.itemCard3.type !== 'item') deck.itemCard3 = null;

      if (!deck.mainChar && validChars.length > 0) deck.mainChar = validChars[0];
      if (!deck.subChar1 && validChars.length > 1) deck.subChar1 = validChars[1];
      if (!deck.subChar2 && validChars.length > 2) deck.subChar2 = validChars[2];
      if (!deck.itemCard1 && validItems.length > 0) deck.itemCard1 = validItems[0];
      if (!deck.itemCard2 && validItems.length > 1) deck.itemCard2 = validItems[1];
      if (!deck.itemCard3 && validItems.length > 2) deck.itemCard3 = validItems[2];

      return deck;
    }

    static setDeckSlot(slotType, card) {
      if (!card) return false;
      const charSlots = ['mainChar', 'subChar1', 'subChar2'];
      const itemSlots = ['itemCard1', 'itemCard2', 'itemCard3'];

      if (charSlots.includes(slotType) && card.type !== 'character') {
        return false;
      }
      if (itemSlots.includes(slotType) && card.type !== 'item') {
        return false;
      }

      const deck = this.getDeck();
      deck[slotType] = card;
      try {
        localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(deck));
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  // ==========================================
  // 4. Battle Engine (3 アイテム選択使用)
  // ==========================================
  class BattleEngine {
    constructor(playerTeam, playerItems, enemyTeam, enemyItems, mode = '1p') {
      this.mode = mode;
      this.playerTeam = (Array.isArray(playerTeam) ? playerTeam : [playerTeam]).map(c => this._normalize(c, true));
      this.enemyTeam = (Array.isArray(enemyTeam) ? enemyTeam : [enemyTeam]).map(c => this._normalize(c, false));
      this.playerIndex = 0;
      this.enemyIndex = 0;

      const pItemsRaw = Array.isArray(playerItems) ? playerItems : [playerItems];
      this.playerItems = pItemsRaw.filter(Boolean);
      this.playerItemUsed = this.playerItems.map(() => false);

      const eItemsRaw = Array.isArray(enemyItems) ? enemyItems : [enemyItems];
      this.enemyItems = eItemsRaw.filter(Boolean);
      this.enemyItemUsed = this.enemyItems.map(() => false);

      this.turn = 1;
      this.maxTurns = (mode === '3p') ? 20 : 10;
      this.isOver = false;
      this.winner = null;
    }

    static getElementMultiplier(attackerElement, defenderElement) {
      if (attackerElement === '火' && defenderElement === '木') return 1.5;
      if (attackerElement === '木' && defenderElement === '水') return 1.5;
      if (attackerElement === '水' && defenderElement === '火') return 1.5;
      return 1.0;
    }

    get playerItemUsesLeft() {
      let count = 0;
      for (let i = 0; i < this.playerItems.length; i++) {
        if (!this.playerItemUsed[i]) count++;
      }
      return count;
    }

    get enemyItemUsesLeft() {
      let count = 0;
      for (let i = 0; i < this.enemyItems.length; i++) {
        if (!this.enemyItemUsed[i]) count++;
      }
      return count;
    }

    _normalize(c, isPlayer) {
      const hp = Math.max(100, Number(c?.hp) || 1200);
      const atk = Math.max(10, Number(c?.atk) || 180);
      const def = Math.max(0, Number(c?.def) || 80);
      const spd = Math.max(5, Number(c?.spd) || 50);

      return {
        id: c?.id || `char_${Math.random()}`,
        name: c?.name || (isPlayer ? "爆炎ドラゴン" : "アクアタイガー"),
        element: c?.element || "火",
        rarity: c?.rarity || "R",
        species: c?.species || "ドラゴン",
        spriteSvg: c?.spriteSvg || null,
        hp: hp,
        maxHp: hp,
        currentHp: hp,
        atk: atk,
        def: def,
        spd: spd,
        skill: c?.skill || { name: "ギガブレイク", desc: "大ダメージ" },
        sp: 0,
        isGuarding: false,
        isPlayer: isPlayer
      };
    }

    get player() { return this.playerTeam[this.playerIndex]; }
    get enemy() { return this.enemyTeam[this.enemyIndex]; }

    processTurn(pAction, pItemIdx = 0, eAction = null, eItemIdx = 0) {
      if (this.isOver) return null;

      if (!eAction) {
        const opts = ['attack', 'attack', 'guard'];
        if (this.enemy.sp >= 100) opts.push('skill');
        if (this.enemyItemUsesLeft > 0 && Math.random() < 0.35) {
          opts.push('item');
          for (let i = 0; i < this.enemyItems.length; i++) {
            if (!this.enemyItemUsed[i]) { eItemIdx = i; break; }
          }
        }
        eAction = opts[Math.floor(Math.random() * opts.length)];
      }

      const turnLog = { turn: this.turn, actions: [] };

      this.player.isGuarding = (pAction === 'guard');
      this.enemy.isGuarding = (eAction === 'guard');

      if (pAction === 'item' && this.playerItems[pItemIdx] && !this.playerItemUsed[pItemIdx]) {
        this.playerItemUsed[pItemIdx] = true;
        const item = this.playerItems[pItemIdx];
        this._applyItemEffect(item, this.player, this.enemy, 'player', turnLog);
      }

      if (eAction === 'item' && this.enemyItems[eItemIdx] && !this.enemyItemUsed[eItemIdx]) {
        this.enemyItemUsed[eItemIdx] = true;
        const item = this.enemyItems[eItemIdx];
        this._applyItemEffect(item, this.enemy, this.player, 'enemy', turnLog);
      }

      if (this.player.isGuarding) {
        this.player.sp = Math.min(100, this.player.sp + 35);
        turnLog.actions.push({ actor: 'player', message: `🛡️ ${this.player.name} は ガード！ (被ダメ半減 & SP+35)` });
      }
      if (this.enemy.isGuarding) {
        this.enemy.sp = Math.min(100, this.enemy.sp + 35);
        turnLog.actions.push({ actor: 'enemy', message: `🛡️ ${this.enemy.name} は ガード！ (被ダメ半減 & SP+35)` });
      }

      const pPriority = this.player.isGuarding ? 9999 : this.player.spd * (0.85 + Math.random() * 0.3);
      const ePriority = this.enemy.isGuarding ? 9999 : this.enemy.spd * (0.85 + Math.random() * 0.3);

      const first = (pPriority >= ePriority) ? 'player' : 'enemy';
      const second = (first === 'player') ? 'enemy' : 'player';

      const actMap = {
        player: { action: pAction, self: this.player, target: this.enemy },
        enemy: { action: eAction, self: this.enemy, target: this.player }
      };

      this._execAction(actMap[first], turnLog);
      if (!this._checkWin(turnLog)) {
        this._execAction(actMap[second], turnLog);
        this._checkWin(turnLog);
      }

      if (!this.isOver) {
        this.turn++;
        if (this.turn > this.maxTurns) {
          this.isOver = true;
          this.winner = (this.player.currentHp >= this.enemy.currentHp) ? 'player' : 'enemy';
          turnLog.actions.push({ actor: 'system', message: `${this.maxTurns}ターン けいか！ 勝敗判定！` });
        }
      }

      return turnLog;
    }

    _applyItemEffect(item, user, opponent, actorRole, turnLog) {
      const type = item.effectType || "heal";
      const val = item.value || 300;
      const actorLabel = (actorRole === 'player') ? "あなた" : "相手";
      const leftCount = (actorRole === 'player') ? this.playerItemUsesLeft : this.enemyItemUsesLeft;

      if (type === 'heal') {
        user.currentHp = Math.min(user.maxHp, user.currentHp + val);
        turnLog.actions.push({ actor: actorRole, message: `💊 ${actorLabel}は【${item.name}】をつかった！ (のこり${leftCount}回) -> HP ${val} かいふく！` });
      } else if (type === 'buff_atk') {
        user.atk += val;
        turnLog.actions.push({ actor: actorRole, message: `⚔️ ${actorLabel}は【${item.name}】をつかった！ (のこり${leftCount}回) -> ATK +${val}！` });
      } else if (type === 'buff_def') {
        user.def += val;
        turnLog.actions.push({ actor: actorRole, message: `🛡️ ${actorLabel}は【${item.name}】をつかった！ (のこり${leftCount}回) -> DEF +${val}！` });
      } else if (type === 'buff_spd') {
        user.spd += val;
        turnLog.actions.push({ actor: actorRole, message: `⚡ ${actorLabel}は【${item.name}】をつかった！ (のこり${leftCount}回) -> SPD +${val}！` });
      } else if (type === 'charge_sp') {
        user.sp = 100;
        turnLog.actions.push({ actor: actorRole, message: `✨ ${actorLabel}は【${item.name}】をつかった！ (のこり${leftCount}回) -> SP 100% 充填！` });
      } else if (type === 'bomb') {
        opponent.currentHp = Math.max(0, opponent.currentHp - val);
        turnLog.actions.push({ actor: actorRole, message: `💥 【${item.name}】爆発！ (のこり${leftCount}回) -> ${opponent.name} に ${val} の固定ダメージ！` });
      } else if (type === 'heal_def') {
        user.currentHp = Math.min(user.maxHp, user.currentHp + val);
        user.def += 40;
        turnLog.actions.push({ actor: actorRole, message: `🧪 ${actorLabel}は【${item.name}】をつかった！ (のこり${leftCount}回) -> HP ${val} 回復 & DEF +40！` });
      } else if (type === 'all_buff') {
        user.atk += val;
        user.def += val;
        user.spd += val;
        turnLog.actions.push({ actor: actorRole, message: `👑 【${item.name}】全能力アップ！ (のこり${leftCount}回) -> 全能力 +${val}！` });
      }
    }

    _execAction({ action, self, target }, turnLog) {
      if (self.currentHp <= 0 || target.currentHp <= 0) return;
      if (action === 'guard' || action === 'item') return;

      if (Math.random() < 0.04) {
        turnLog.actions.push({ actor: self.isPlayer ? 'player' : 'enemy', message: `${self.name} の こうげき！ しかし MISS!` });
        return;
      }

      const baseDamage = self.atk * 2.5 * (100 / (100 + target.def * 0.35));
      const minGuaranteed = self.atk * 0.50;
      let raw = Math.max(minGuaranteed, baseDamage);

      let mult = BattleEngine.getElementMultiplier(self.element, target.element);
      let rand = 0.95 + Math.random() * 0.10;
      let dmg = Math.max(1, Math.round(raw * mult * rand));

      if (action === 'skill') {
        if (self.sp >= 100) {
          self.sp = 0;
          dmg = Math.round(dmg * 1.85);
          turnLog.actions.push({ actor: self.isPlayer ? 'player' : 'enemy', message: `✨ ${self.name} の ひっさつ技【ギガブレイク】発動！` });
        } else {
          action = 'attack';
        }
      }

      if (action === 'attack') {
        self.sp = Math.min(100, self.sp + 35);
      }

      if (target.isGuarding) dmg = Math.max(1, Math.round(dmg * 0.5));

      target.currentHp = Math.max(0, target.currentHp - dmg);
      target.sp = Math.min(100, target.sp + 15);

      turnLog.actions.push({
        actor: self.isPlayer ? 'player' : 'enemy',
        message: `${self.name} の こうげき！ -> ${target.name} に ${dmg} ダメージ！`
      });
    }

    _checkWin(turnLog) {
      if (this.enemy.currentHp <= 0) {
        if (this.mode === '3p' && this.enemyIndex < this.enemyTeam.length - 1) {
          this.enemyIndex++;
          turnLog.actions.push({ actor: 'system', message: `🎉 相手のキャラを たおした！ 敵チームは ${this.enemy.name} が 出撃！` });
          return false;
        } else {
          this.isOver = true;
          this.winner = 'player';
          turnLog.actions.push({ actor: 'system', message: `🎉 ${this.enemy.name} を たおした！ あなたの しょうり！` });
          return true;
        }
      }
      if (this.player.currentHp <= 0) {
        if (this.mode === '3p' && this.playerIndex < this.playerTeam.length - 1) {
          this.playerIndex++;
          turnLog.actions.push({ actor: 'system', message: `💧 あなたのキャラが たおれた... つぎの ${this.player.name} が 出撃！` });
          return false;
        } else {
          this.isOver = true;
          this.winner = 'enemy';
          turnLog.actions.push({ actor: 'system', message: `💧 ${this.player.name} は たおれた... あなたの まけ...` });
          return true;
        }
      }
      return false;
    }
  }

  // ==========================================
  // 5. アプリケーション状態管理 & UI
  // ==========================================
  let appState = {
    currentScreen: 'SCR-01',
    scannedCard: null,
    selectedCard: null,
    collectionSubTab: 'all',
    battleMode: '1p',
    battleEngine: null,
    peer: null,
    peerConn: null,
    isHost: false
  };

  let scanVideo = null;
  let scanCanvas = null;
  let scanAnimationId = null;

  function switchScreen(targetId) {
    if (appState.currentScreen === 'SCR-02' && targetId !== 'SCR-02') {
      stopCamera();
    }

    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
    });

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.add('active');
      appState.currentScreen = targetId;
      window.scrollTo(0, 0);

      if (targetId === 'SCR-01') renderHome();
      if (targetId === 'SCR-04') renderCollection();
      if (targetId === 'SCR-05') renderLobby();
    }
  }

  function renderHome() {
    const deck = StorageManager.getDeck();
    const collection = StorageManager.getCollection();
    const mainChar = deck.mainChar;

    const countBadge = document.getElementById('home-count-badge');
    if (countBadge) {
      countBadge.textContent = `しょじ ${collection.length}/100`;
    }

    const showcase = document.getElementById('home-showcase');
    if (!showcase) return;

    if (mainChar) {
      const spriteSvg = getCharacterSpriteSvg(mainChar);
      showcase.innerHTML = `
        <div class="sprite-container" style="width:140px; height:140px;">
          ${spriteSvg}
        </div>
        <div class="char-name" style="font-weight:900;">
          <span class="rarity-tag" style="color:var(--accent-gold); font-size:1.1rem;">[${mainChar.rarity || 'N'}]</span>
          ${mainChar.name}
        </div>
        <div style="margin: 4px 0;">
          <span class="element-tag element-${mainChar.element}">属性: ${mainChar.element}</span>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">種族: ${mainChar.species || 'ドラゴン'}</span>
        </div>
        <div style="display:flex; gap:10px; font-size:0.85rem; font-weight:800; margin-top:6px;">
          <span style="color:#00ff88;">HP: ${mainChar.hp}</span>
          <span style="color:#ff3366;">ATK: ${mainChar.atk}</span>
          <span style="color:#00e5ff;">DEF: ${mainChar.def}</span>
          <span style="color:#ffd700;">SPD: ${mainChar.spd}</span>
        </div>
      `;
    } else {
      showcase.innerHTML = `
        <div style="color: var(--text-muted); padding: 20px 0; text-align:center;">
          バーコードを スキャンして<br>キャラを ゲットしよう！
        </div>
      `;
    }
  }

  function renderCollection() {
    const collection = StorageManager.getCollection();
    const deck = StorageManager.getDeck();
    const grid = document.getElementById('collection-grid-container');
    if (!grid) return;

    let filtered = collection;
    if (appState.collectionSubTab === 'char') {
      filtered = collection.filter(c => c.type === 'character');
    } else if (appState.collectionSubTab === 'item') {
      filtered = collection.filter(c => c.type === 'item');
    }

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:30px 10px; color:var(--text-muted);">カードがありません。バーコードをスキャンして登録しよう！</div>`;
      renderDeckView();
      return;
    }

    grid.innerHTML = filtered.map(card => {
      let roleBadge = "";
      let isSet = false;

      if (deck.mainChar && deck.mainChar.id === card.id) { roleBadge = `<span class="slot-badge badge-main">⚔️ メイン</span>`; isSet = true; }
      else if (deck.subChar1 && deck.subChar1.id === card.id) { roleBadge = `<span class="slot-badge badge-sub1">🛡️ サブ1</span>`; isSet = true; }
      else if (deck.subChar2 && deck.subChar2.id === card.id) { roleBadge = `<span class="slot-badge badge-sub2">🛡️ サブ2</span>`; isSet = true; }
      else if (deck.itemCard1 && deck.itemCard1.id === card.id) { roleBadge = `<span class="slot-badge badge-item">💊 アイテム1</span>`; isSet = true; }
      else if (deck.itemCard2 && deck.itemCard2.id === card.id) { roleBadge = `<span class="slot-badge badge-item">💊 アイテム2</span>`; isSet = true; }
      else if (deck.itemCard3 && deck.itemCard3.id === card.id) { roleBadge = `<span class="slot-badge badge-item">💊 アイテム3</span>`; isSet = true; }

      const deckRibbon = isSet ? `<span class="deck-ribbon">✅ DECK</span>` : '';
      const spriteSvg = getCharacterSpriteSvg(card);
      const isItem = (card.type === 'item');
      const rarityClass = `rarity-${card.rarity || 'N'}`;

      return `
        <div class="card-item ${isItem ? 'item-card' : ''} ${isSet ? 'is-deck-set' : ''} ${rarityClass}" onclick="window.appOpenCardDetail('${card.id}')">
          ${deckRibbon}
          ${roleBadge}
          <div class="mini-sprite">
            ${spriteSvg}
          </div>
          <div style="font-weight:800; font-size:0.8rem; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">
            <span style="color:var(--accent-gold); font-size:0.72rem;">[${card.rarity || 'N'}]</span> ${card.name}
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">
            ${isItem ? `<span style="color:var(--accent-gold);">${card.desc}</span>` : `<span class="element-tag element-${card.element}" style="padding:1px 4px; font-size:0.62rem;">${card.element}</span> HP:${card.hp} ATK:${card.atk}`}
          </div>
        </div>
      `;
    }).join('');

    renderDeckView();
  }

  function renderDeckView() {
    const deck = StorageManager.getDeck();

    const mainEl = document.getElementById('slot-content-main');
    const sub1El = document.getElementById('slot-content-sub1');
    const sub2El = document.getElementById('slot-content-sub2');
    const item1El = document.getElementById('slot-content-item1');
    const item2El = document.getElementById('slot-content-item2');
    const item3El = document.getElementById('slot-content-item3');

    if (mainEl) mainEl.innerHTML = deck.mainChar ? `<span style="color:#00ff88;">[${deck.mainChar.rarity || 'N'}] ${deck.mainChar.name} (HP:${deck.mainChar.hp} ATK:${deck.mainChar.atk})</span>` : `<span style="color:var(--text-muted);">未セット</span>`;
    if (sub1El) sub1El.innerHTML = deck.subChar1 ? `<span style="color:#00e5ff;">[${deck.subChar1.rarity || 'N'}] ${deck.subChar1.name} (HP:${deck.subChar1.hp} ATK:${deck.subChar1.atk})</span>` : `<span style="color:var(--text-muted);">未セット</span>`;
    if (sub2El) sub2El.innerHTML = deck.subChar2 ? `<span style="color:#ff0055;">[${deck.subChar2.rarity || 'N'}] ${deck.subChar2.name} (HP:${deck.subChar2.hp} ATK:${deck.subChar2.atk})</span>` : `<span style="color:var(--text-muted);">未セット</span>`;
    if (item1El) item1El.innerHTML = deck.itemCard1 ? `<span style="color:var(--accent-gold);">[${deck.itemCard1.rarity || 'N'}] ${deck.itemCard1.name} (${deck.itemCard1.desc})</span>` : `<span style="color:var(--text-muted);">未セット</span>`;
    if (item2El) item2El.innerHTML = deck.itemCard2 ? `<span style="color:var(--accent-gold);">[${deck.itemCard2.rarity || 'N'}] ${deck.itemCard2.name} (${deck.itemCard2.desc})</span>` : `<span style="color:var(--text-muted);">未セット</span>`;
    if (item3El) item3El.innerHTML = deck.itemCard3 ? `<span style="color:var(--accent-gold);">[${deck.itemCard3.rarity || 'N'}] ${deck.itemCard3.name} (${deck.itemCard3.desc})</span>` : `<span style="color:var(--text-muted);">未セット</span>`;
  }

  function openCardDetail(cardId) {
    const collection = StorageManager.getCollection();
    const card = collection.find(c => c.id === cardId);
    if (!card) return;

    appState.selectedCard = card;
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-card-content');
    if (!modal || !content) return;

    const isItem = (card.type === 'item');
    const spriteSvg = getCharacterSpriteSvg(card);

    content.innerHTML = `
      <div class="sprite-container" style="width:130px; height:130px; margin: 0 auto;">
        ${spriteSvg}
      </div>
      <div style="font-size:1.1rem; font-weight:900; margin: 6px 0;">
        <span style="color:var(--accent-gold);">[${card.rarity || 'N'}]</span> ${card.name}
      </div>
      ${isItem ? `
        <div style="color:var(--accent-gold); font-size:0.9rem; font-weight:800; margin: 4px 0;">${card.desc}</div>
      ` : `
        <div style="margin: 4px 0;">
          <span class="element-tag element-${card.element}">属性: ${card.element}</span>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">種族: ${card.species || 'ドラゴン'}</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.85rem; font-weight:800; margin: 8px 0; background:rgba(0,0,0,0.3); padding:8px; border-radius:10px;">
          <div style="color:#00ff88;">HP: ${card.hp}</div>
          <div style="color:#ff3366;">ATK: ${card.atk}</div>
          <div style="color:#00e5ff;">DEF: ${card.def}</div>
          <div style="color:#ffd700;">SPD: ${card.spd}</div>
        </div>
      `}
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
        📝 メモ: ${card.memo || 'なし'} (JAN: ${card.barcode || '---'})
      </div>
    `;

    const btnMain = document.getElementById('btn-set-main');
    const btnSub1 = document.getElementById('btn-set-sub1');
    const btnSub2 = document.getElementById('btn-set-sub2');
    const btnItem1 = document.getElementById('btn-set-item1');
    const btnItem2 = document.getElementById('btn-set-item2');
    const btnItem3 = document.getElementById('btn-set-item3');

    if (isItem) {
      if (btnMain) btnMain.style.display = 'none';
      if (btnSub1) btnSub1.style.display = 'none';
      if (btnSub2) btnSub2.style.display = 'none';
      if (btnItem1) btnItem1.style.display = 'block';
      if (btnItem2) btnItem2.style.display = 'block';
      if (btnItem3) btnItem3.style.display = 'block';
    } else {
      if (btnMain) btnMain.style.display = 'block';
      if (btnSub1) btnSub1.style.display = 'block';
      if (btnSub2) btnSub2.style.display = 'block';
      if (btnItem1) btnItem1.style.display = 'none';
      if (btnItem2) btnItem2.style.display = 'none';
      if (btnItem3) btnItem3.style.display = 'none';
    }

    modal.classList.add('active');
  }

  function handleScanBarcode(codeStr) {
    if (!codeStr) return;
    const card = BarcodeEngine.generateFromBarcode(codeStr);
    appState.scannedCard = card;

    const resCard = document.getElementById('scan-result-card');
    if (resCard) {
      const isItem = (card.type === 'item');
      const spriteSvg = getCharacterSpriteSvg(card);

      resCard.innerHTML = `
        <div class="sprite-container" style="width:140px; height:140px; margin: 0 auto;">
          ${spriteSvg}
        </div>
        <div class="char-name" style="font-weight:900;">
          <span style="color:var(--accent-gold);">[${card.rarity || 'N'}]</span> ${card.name}
        </div>
        ${isItem ? `
          <div style="color:var(--accent-gold); font-size:0.95rem; font-weight:800;">${card.desc}</div>
        ` : `
          <div style="margin: 4px 0;">
            <span class="element-tag element-${card.element}">属性: ${card.element}</span>
            <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">種族: ${card.species || 'ドラゴン'}</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:0.88rem; font-weight:800; margin: 8px 0; background:rgba(0,0,0,0.3); padding:8px; border-radius:10px;">
            <span style="color:#00ff88;">HP: ${card.hp}</span>
            <span style="color:#ff3366;">ATK: ${card.atk}</span>
            <span style="color:#00e5ff;">DEF: ${card.def}</span>
            <span style="color:#ffd700;">SPD: ${card.spd}</span>
          </div>
        `}
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">JANコード: ${card.barcode}</div>
      `;
    }

    const memoInput = document.getElementById('scanned-memo-input');
    if (memoInput) memoInput.value = "";

    switchScreen('SCR-03');
  }

  function startCamera() {
    scanVideo = document.getElementById('scan-video');
    scanCanvas = document.getElementById('scan-canvas');
    const msg = document.getElementById('camera-status-msg');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (msg) msg.textContent = "お使いのブラウザはカメラに対応していません。テストボタンをご利用ください。";
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then(stream => {
      if (scanVideo) {
        scanVideo.srcObject = stream;
        scanVideo.play();
        if (msg) msg.textContent = "カメラをバーコードに合わせてください...";
        scanBarcodeLoop();
      }
    }).catch(err => {
      if (msg) msg.textContent = "カメラの起動に失敗しました。下のテストコードをお試しください。";
    });
  }

  function stopCamera() {
    if (scanAnimationId) {
      cancelAnimationFrame(scanAnimationId);
      scanAnimationId = null;
    }
    if (scanVideo && scanVideo.srcObject) {
      const tracks = scanVideo.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      scanVideo.srcObject = null;
    }
  }

  function scanBarcodeLoop() {
    if (!scanVideo || scanVideo.readyState !== scanVideo.HAVE_ENOUGH_DATA) {
      scanAnimationId = requestAnimationFrame(scanBarcodeLoop);
      return;
    }

    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'qr_code', 'code_128'] });
      detector.detect(scanVideo).then(barcodes => {
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          stopCamera();
          handleScanBarcode(raw);
        } else {
          scanAnimationId = requestAnimationFrame(scanBarcodeLoop);
        }
      }).catch(() => {
        scanAnimationId = requestAnimationFrame(scanBarcodeLoop);
      });
    } else {
      scanAnimationId = requestAnimationFrame(scanBarcodeLoop);
    }
  }

  // ==========================================
  // 6. バトル制御 & アイテム選択モーダル
  // ==========================================
  function startCpuBattle() {
    const deck = StorageManager.getDeck();
    let playerTeam = [];
    if (appState.battleMode === '3p') {
      playerTeam = [deck.mainChar, deck.subChar1, deck.subChar2].filter(Boolean);
    } else {
      playerTeam = [deck.mainChar].filter(Boolean);
    }

    if (playerTeam.length === 0) {
      alert("デッキにキャラクターがセットされていません。図鑑からセットしてください。");
      switchScreen('SCR-04');
      return;
    }

    const playerItems = [deck.itemCard1, deck.itemCard2, deck.itemCard3].filter(Boolean);

    const enemyTeam = [];
    const teamCount = (appState.battleMode === '3p') ? 3 : 1;
    for (let i = 0; i < teamCount; i++) {
      const randCode = BarcodeEngine.getRandomBarcode();
      const enemyChar = BarcodeEngine.generateFromBarcode(randCode);
      if (enemyChar.type === 'character') {
        enemyTeam.push(enemyChar);
      } else {
        enemyTeam.push(BarcodeEngine.generateFromBarcode("4901234567890"));
      }
    }

    const enemyItems = [
      BarcodeEngine.generateFromBarcode("4900000000001"),
      BarcodeEngine.generateFromBarcode("4900000000006")
    ];

    appState.battleEngine = new BattleEngine(playerTeam, playerItems, enemyTeam, enemyItems, appState.battleMode);
    switchScreen('SCR-06');
    renderBattleUI();
  }

  function renderBattleUI() {
    const be = appState.battleEngine;
    if (!be) return;

    const p = be.player;
    const e = be.enemy;

    const pName = document.getElementById('p-name');
    const pHpNum = document.getElementById('p-hp-num');
    const pHpBar = document.getElementById('p-hp-bar');
    const pSpBar = document.getElementById('p-sp-bar');
    const pSprite = document.getElementById('p-sprite');

    if (pName) pName.innerHTML = `<span style="color:var(--accent-gold);">[${p.rarity || 'N'}]</span> ${p.name} (${p.element})`;
    if (pHpNum) pHpNum.textContent = `${Math.max(0, p.currentHp)}/${p.maxHp}`;
    if (pHpBar) pHpBar.style.width = `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%`;
    if (pSpBar) pSpBar.style.width = `${Math.min(100, p.sp)}%`;
    if (pSprite) pSprite.innerHTML = getCharacterSpriteSvg(p);

    const eName = document.getElementById('e-name');
    const eHpNum = document.getElementById('e-hp-num');
    const eHpBar = document.getElementById('e-hp-bar');
    const eSpBar = document.getElementById('e-sp-bar');
    const eSprite = document.getElementById('e-sprite');

    if (eName) eName.innerHTML = `<span style="color:var(--accent-gold);">[${e.rarity || 'N'}]</span> ${e.name} (${e.element})`;
    if (eHpNum) eHpNum.textContent = `${Math.max(0, e.currentHp)}/${e.maxHp}`;
    if (eHpBar) eHpBar.style.width = `${Math.max(0, (e.currentHp / e.maxHp) * 100)}%`;
    if (eSpBar) eSpBar.style.width = `${Math.min(100, e.sp)}%`;
    if (eSprite) eSprite.innerHTML = getCharacterSpriteSvg(e);

    const btnSkill = document.getElementById('btn-cmd-skill');
    if (btnSkill) {
      btnSkill.disabled = (p.sp < 100 || be.isOver);
    }

    const btnItem = document.getElementById('btn-cmd-item');
    if (btnItem) {
      const left = be.playerItemUsesLeft;
      const total = be.playerItems.length;
      btnItem.textContent = `💊 アイテム (${left}/${total})`;
      btnItem.disabled = (left <= 0 || be.isOver);
    }

    const btnAtk = document.getElementById('btn-cmd-attack');
    const btnGrd = document.getElementById('btn-cmd-guard');
    if (btnAtk) btnAtk.disabled = be.isOver;
    if (btnGrd) btnGrd.disabled = be.isOver;
  }

  function openBattleItemSelectModal() {
    const be = appState.battleEngine;
    if (!be || be.isOver) return;

    const modal = document.getElementById('battle-item-modal');
    const list = document.getElementById('battle-item-list');
    if (!modal || !list) return;

    if (be.playerItems.length === 0) {
      list.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:10px;">セットされたアイテムがありません。</div>`;
    } else {
      list.innerHTML = be.playerItems.map((item, idx) => {
        const isUsed = be.playerItemUsed[idx];
        return `
          <button class="btn ${isUsed ? 'btn-dark' : 'btn-gold'}" style="margin:0; min-height:44px; font-size:0.85rem;" ${isUsed ? 'disabled' : ''} onclick="window.appExecutePlayerAction('item', ${idx})">
            ${item.name} (${item.desc}) ${isUsed ? '【使用済】' : '【つかう】'}
          </button>
        `;
      }).join('');
    }

    modal.classList.add('active');
  }

  function executePlayerAction(action, itemIdx = 0) {
    const itemModal = document.getElementById('battle-item-modal');
    if (itemModal) itemModal.classList.remove('active');

    const be = appState.battleEngine;
    if (!be || be.isOver) return;

    const result = be.processTurn(action, itemIdx);
    if (!result) return;

    const logBox = document.getElementById('battle-log');
    if (logBox) {
      result.actions.forEach(act => {
        const div = document.createElement('div');
        div.style.margin = '2px 0';
        div.textContent = act.message;
        logBox.appendChild(div);
      });
      logBox.scrollTop = logBox.scrollHeight;
    }

    renderBattleUI();

    if (be.isOver) {
      const winner = be.winner;
      setTimeout(() => {
        alert(winner === 'player' ? '🎉 あなたの勝利です！' : '💧 敗北しました...');
      }, 500);
    }
  }

  function renderLobby() {
    const viewLobby = document.getElementById('lobby-select-view');
    const viewWait = document.getElementById('lobby-host-wait-view');
    if (viewLobby) viewLobby.style.display = 'block';
    if (viewWait) viewWait.style.display = 'none';

    const btn1p = document.getElementById('btn-mode-1p');
    const btn3p = document.getElementById('btn-mode-3p');
    if (btn1p) btn1p.className = (appState.battleMode === '1p') ? 'mode-btn active' : 'mode-btn';
    if (btn3p) btn3p.className = (appState.battleMode === '3p') ? 'mode-btn active' : 'mode-btn';
  }

  function createRoom() {
    const deck = StorageManager.getDeck();
    if (!deck.mainChar) {
      alert("デッキにキャラクターがセットされていません。");
      switchScreen('SCR-04');
      return;
    }

    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    appState.isHost = true;

    const hostCodeEl = document.getElementById('host-room-code');
    if (hostCodeEl) hostCodeEl.textContent = roomCode;

    const viewLobby = document.getElementById('lobby-select-view');
    const viewWait = document.getElementById('lobby-host-wait-view');
    if (viewLobby) viewLobby.style.display = 'none';
    if (viewWait) viewWait.style.display = 'block';

    try {
      const peer = new Peer(`bb-v23-${roomCode}`, { debug: 1 });
      appState.peer = peer;

      peer.on('connection', conn => {
        appState.peerConn = conn;
        conn.on('data', data => {
          if (data && data.type === 'JOIN') {
            const playerTeam = (appState.battleMode === '3p') ? [deck.mainChar, deck.subChar1, deck.subChar2].filter(Boolean) : [deck.mainChar];
            const playerItems = [deck.itemCard1, deck.itemCard2, deck.itemCard3].filter(Boolean);
            const enemyTeam = data.team || [];
            const enemyItems = data.items || [];

            conn.send({
              type: 'START',
              team: playerTeam,
              items: playerItems,
              mode: appState.battleMode
            });

            appState.battleEngine = new BattleEngine(playerTeam, playerItems, enemyTeam, enemyItems, appState.battleMode);
            switchScreen('SCR-06');
            renderBattleUI();
          }
        });
      });
    } catch (e) {
      console.warn("PeerJS host initialization failed:", e);
    }
  }

  function joinRoom() {
    const codeInput = document.getElementById('input-guest-code');
    const code = codeInput ? codeInput.value.trim() : "";
    if (!code || code.length !== 4) {
      alert("4桁のルームコードを入力してください。");
      return;
    }

    const deck = StorageManager.getDeck();
    if (!deck.mainChar) {
      alert("デッキにキャラクターがセットされていません。");
      switchScreen('SCR-04');
      return;
    }

    try {
      const peer = new Peer();
      appState.peer = peer;

      peer.on('open', () => {
        const conn = peer.connect(`bb-v23-${code}`);
        appState.peerConn = conn;

        conn.on('open', () => {
          const playerTeam = (appState.battleMode === '3p') ? [deck.mainChar, deck.subChar1, deck.subChar2].filter(Boolean) : [deck.mainChar];
          const playerItems = [deck.itemCard1, deck.itemCard2, deck.itemCard3].filter(Boolean);

          conn.send({
            type: 'JOIN',
            team: playerTeam,
            items: playerItems
          });
        });

        conn.on('data', data => {
          if (data && data.type === 'START') {
            const playerTeam = (appState.battleMode === '3p') ? [deck.mainChar, deck.subChar1, deck.subChar2].filter(Boolean) : [deck.mainChar];
            const playerItems = [deck.itemCard1, deck.itemCard2, deck.itemCard3].filter(Boolean);
            const enemyTeam = data.team || [];
            const enemyItems = data.items || [];

            appState.battleEngine = new BattleEngine(playerTeam, playerItems, enemyTeam, enemyItems, data.mode || appState.battleMode);
            switchScreen('SCR-06');
            renderBattleUI();
          }
        });
      });
    } catch (e) {
      console.warn("PeerJS guest join failed:", e);
    }
  }

  function cancelHost() {
    if (appState.peer) {
      appState.peer.destroy();
      appState.peer = null;
    }
    renderLobby();
  }

  // ==========================================
  // 7. グローバル公開 & 初期化バインド
  // ==========================================
  window.appSwitchScreen = switchScreen;
  window.appStartCamera = startCamera;
  window.appOpenCardDetail = openCardDetail;
  window.appSelectTab = function(tab) {
    const colTab = document.getElementById('view-collection-tab');
    const deckTab = document.getElementById('view-deck-tab');
    const btnCol = document.getElementById('tab-btn-collection');
    const btnDeck = document.getElementById('tab-btn-deck');

    if (tab === 'col') {
      if (colTab) colTab.style.display = 'flex';
      if (deckTab) deckTab.style.display = 'none';
      if (btnCol) btnCol.classList.add('active');
      if (btnDeck) btnDeck.classList.remove('active');
      renderCollection();
    } else {
      if (colTab) colTab.style.display = 'none';
      if (deckTab) deckTab.style.display = 'flex';
      if (btnCol) btnCol.classList.remove('active');
      if (btnDeck) btnDeck.classList.add('active');
      renderDeckView();
    }
  };

  window.appSelectSubTab = function(subTab) {
    appState.collectionSubTab = subTab;
    document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`sub-tab-${subTab}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderCollection();
  };

  window.appSetMode = function(mode) {
    appState.battleMode = mode;
    renderLobby();
  };

  window.appStartCpuBattle = startCpuBattle;
  window.appCreateRoom = createRoom;
  window.appJoinRoom = joinRoom;
  window.appCancelHost = cancelHost;
  window.appExecutePlayerAction = executePlayerAction;

  document.addEventListener('DOMContentLoaded', () => {
    StorageManager.migrateCollectionData();

    // デモ用バーコードボタン
    document.querySelectorAll('.btn-demo-barcode').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        handleScanBarcode(code);
      });
    });

    // 手動入力ボタン
    const btnManual = document.getElementById('btn-manual-scan');
    const inputManual = document.getElementById('input-manual-barcode');
    if (btnManual && inputManual) {
      btnManual.addEventListener('click', () => {
        const code = inputManual.value.trim();
        if (code) handleScanBarcode(code);
      });
    }

    // 保存ボタン
    const btnSave = document.getElementById('btn-save-scanned');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (appState.scannedCard) {
          const memo = document.getElementById('scanned-memo-input')?.value || "";
          appState.scannedCard.memo = memo;
          StorageManager.saveToCollection(appState.scannedCard);
          alert(`「${appState.scannedCard.name}」を ずかんに ほぞんしました！`);
          switchScreen('SCR-04');
        }
      });
    }

    // デッキセットボタン
    document.getElementById('btn-set-main')?.addEventListener('click', () => {
      if (appState.selectedCard) {
        StorageManager.setDeckSlot('mainChar', appState.selectedCard);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });
    document.getElementById('btn-set-sub1')?.addEventListener('click', () => {
      if (appState.selectedCard) {
        StorageManager.setDeckSlot('subChar1', appState.selectedCard);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });
    document.getElementById('btn-set-sub2')?.addEventListener('click', () => {
      if (appState.selectedCard) {
        StorageManager.setDeckSlot('subChar2', appState.selectedCard);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });
    document.getElementById('btn-set-item1')?.addEventListener('click', () => {
      if (appState.selectedCard) {
        StorageManager.setDeckSlot('itemCard1', appState.selectedCard);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });
    document.getElementById('btn-set-item2')?.addEventListener('click', () => {
      if (appState.selectedCard) {
        StorageManager.setDeckSlot('itemCard2', appState.selectedCard);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });
    document.getElementById('btn-set-item3')?.addEventListener('click', () => {
      if (appState.selectedCard) {
        StorageManager.setDeckSlot('itemCard3', appState.selectedCard);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });

    // メモ編集
    document.getElementById('btn-edit-memo')?.addEventListener('click', () => {
      if (!appState.selectedCard) return;
      const current = appState.selectedCard.memo || "";
      const updated = prompt("カードのメモを入力してください:", current);
      if (updated !== null) {
        StorageManager.updateMemo(appState.selectedCard.id, updated);
        appState.selectedCard.memo = updated;
        openCardDetail(appState.selectedCard.id);
        renderCollection();
      }
    });

    // カード削除
    document.getElementById('btn-delete-card')?.addEventListener('click', () => {
      if (!appState.selectedCard) return;
      if (confirm(`「${appState.selectedCard.name}」を 本当に 削除しますか？`)) {
        StorageManager.deleteFromCollection(appState.selectedCard.id);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
      }
    });

    // バトルコマンドボタン
    document.getElementById('btn-cmd-attack')?.addEventListener('click', () => executePlayerAction('attack'));
    document.getElementById('btn-cmd-skill')?.addEventListener('click', () => executePlayerAction('skill'));
    document.getElementById('btn-cmd-guard')?.addEventListener('click', () => executePlayerAction('guard'));
    document.getElementById('btn-cmd-item')?.addEventListener('click', openBattleItemSelectModal);
    document.getElementById('btn-close-battle-item')?.addEventListener('click', () => {
      document.getElementById('battle-item-modal')?.classList.remove('active');
    });

    renderHome();
  });

})();
