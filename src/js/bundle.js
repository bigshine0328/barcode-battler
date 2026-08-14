/**
 * Barcode Battler - Official Release JS (v2.3.0 20 Species, New Rarity, 3 Item Slots)
 * 20種族生成、新レアリティ確率分布(3%/12%/25%/60%)、アイテム3スロット編成・図鑑ハイライト
 */

(function() {
  "use strict";
  console.log("Barcode Battler v2.3.0 initializing...");

  // --- 1. Monster Visual System (20 Species) ---
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

  const SPECIES_SVGS = {
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

  const ITEM_SVGS = {
    "heal": `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="25" ry="30" fill="#00e5ff"/><rect x="42" y="15" width="16" height="15" rx="4" fill="#fff"/><path d="M50 40 L50 70 M35 55 L65 55" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`,
    "buff_atk": `<svg viewBox="0 0 100 100"><path d="M50 10 L65 40 L55 40 L55 85 L45 85 L45 40 L35 40 Z" fill="#ff3366"/><path d="M30 65 L50 85 L70 65" stroke="#ffea00" stroke-width="6" fill="none"/></svg>`,
    "buff_def": `<svg viewBox="0 0 100 100"><path d="M50 10 L85 25 L85 55 Q85 85 50 95 Q15 85 15 55 L15 25 Z" fill="#b066ff"/><path d="M50 25 L50 80 M30 50 L70 50" stroke="#fff" stroke-width="5"/></svg>`,
    "buff_spd": `<svg viewBox="0 0 100 100"><path d="M20 70 Q40 20 85 30 Q60 60 40 85 Z" fill="#00ffcc"/><path d="M10 40 L40 50 M15 60 L45 70" stroke="#ffea00" stroke-width="5" stroke-linecap="round"/></svg>`,
    "charge_sp": `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#ffea00"/><polygon points="50,18 60,38 82,38 64,52 71,74 50,60 29,74 36,52 18,38 40,38" fill="#fff"/></svg>`,
    "bomb": `<svg viewBox="0 0 100 100"><circle cx="45" cy="55" r="32" fill="#333"/><path d="M65 35 Q80 20 90 25" stroke="#ff9900" stroke-width="4" fill="none"/><circle cx="90" cy="25" r="6" fill="#ff0055"/></svg>`,
    "heal_def": `<svg viewBox="0 0 100 100"><path d="M50 15 L80 30 L80 60 Q80 85 50 92 Q20 85 20 60 L20 30 Z" fill="#00e5ff"/><path d="M50 35 C50 35 35 25 35 42 C35 52 50 65 50 65 C50 65 65 52 65 42 C65 25 50 35 50 35 Z" fill="#ff3366"/></svg>`,
    "all_buff": `<svg viewBox="0 0 100 100"><path d="M20 75 L30 30 L50 55 L70 30 L80 75 Z" fill="#ffea00"/><circle cx="30" cy="25" r="5" fill="#ff0055"/><circle cx="50" cy="20" r="6" fill="#00e5ff"/><circle cx="70" cy="25" r="5" fill="#b066ff"/></svg>`
  };

  function getCharacterSpriteSvg(card) {
    if (!card) return SPECIES_SVGS["ドラゴン"];
    if (card.spriteSvg && card.spriteSvg.includes("<svg")) {
      return card.spriteSvg;
    }
    const nameStr = card.name || card.species || "";
    for (let baseName of BASE_NAMES) {
      if (nameStr.includes(baseName)) {
        return SPECIES_SVGS[baseName];
      }
    }
    return SPECIES_SVGS["ドラゴン"];
  }

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

      // ★新レアリティ確率分布: SSR: 3%, SR: 12%, R: 25%, N: 60%
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
        const itemSvg = ITEM_SVGS[itemBase.type] || ITEM_SVGS["heal"];

        return {
          id: `item_${cleaned}_${hash}`,
          barcode: cleaned,
          type: "item",
          name: `${rarity === 'SSR' ? '✨ [SSR] ' : rarity === 'SR' ? '🌟 [SR] ' : ''}${itemBase.name}`,
          effectType: itemBase.type,
          value: finalValue,
          desc: itemBase.getDesc(finalValue),
          rarity: rarity,
          spriteSvg: itemSvg,
          memo: customMemo || "バーコードアイテム",
          createdAt: new Date().toISOString()
        };
      }

      // 決定論的ステータス
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

      // ★20種族決定論的マッピング
      const pIdx = hash % PREFIXES.length;
      const bIdx = (hash + 1) % BASE_NAMES.length; // 20種族
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

  // --- 2. StorageManager (3 Items Support) ---
  const STORAGE_KEY_COLLECTION = "barcode_battler_collection";
  const STORAGE_KEY_DECK = "barcode_battler_deck";

  class StorageManager {
    static getCollection() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_COLLECTION);
        return data ? JSON.parse(data) : [];
      } catch (e) { return []; }
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
        if (collection.length >= 100) collection.shift(); // 100枚FIFO
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

      // デッキにセットされていたら解除 (3アイテム対応)
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
        alert("⚠️ キャラクター枠には アイテムカードを セットできません！");
        return false;
      }
      if (itemSlots.includes(slotType) && card.type !== 'item') {
        alert("⚠️ アイテム枠には キャラクターを セットできません！");
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

  // --- 3. BattleEngine (3 Items Choice Support) ---
  class BattleEngine {
    constructor(playerTeam, playerItems, enemyTeam, enemyItems, mode = '1p') {
      this.mode = mode;
      this.playerTeam = (Array.isArray(playerTeam) ? playerTeam : [playerTeam]).map(c => this._normalize(c, true));
      this.enemyTeam = (Array.isArray(enemyTeam) ? enemyTeam : [enemyTeam]).map(c => this._normalize(c, false));
      this.playerIndex = 0;
      this.enemyIndex = 0;

      // 3アイテムの配列管理
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
      const spriteSvg = getCharacterSpriteSvg(c);

      return {
        id: c?.id || `char_${Math.random()}`,
        name: c?.name || (isPlayer ? "爆炎ドラゴン" : "アクアタイガー"),
        element: c?.element || "火",
        rarity: c?.rarity || "R",
        hp: hp,
        maxHp: hp,
        currentHp: hp,
        atk: atk,
        def: def,
        spd: spd,
        skill: c?.skill || { name: "ギガブレイク", desc: "大ダメージ" },
        spriteSvg: spriteSvg,
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
          // 敵の未消費アイテムを探す
          for (let i = 0; i < this.enemyItems.length; i++) {
            if (!this.enemyItemUsed[i]) { eItemIdx = i; break; }
          }
        }
        eAction = opts[Math.floor(Math.random() * opts.length)];
      }

      const turnLog = { turn: this.turn, actions: [] };

      this.player.isGuarding = (pAction === 'guard');
      this.enemy.isGuarding = (eAction === 'guard');

      // プレイヤーのアイテム発動
      if (pAction === 'item' && this.playerItems[pItemIdx] && !this.playerItemUsed[pItemIdx]) {
        this.playerItemUsed[pItemIdx] = true;
        const item = this.playerItems[pItemIdx];
        this._applyItemEffect(item, this.player, this.enemy, 'player', turnLog);
      }

      // 敵のアイテム発動
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

      let mult = (self.element === '火' && target.element === '木') ? 1.5 : 1.0;
      if (self.element === '木' && target.element === '水') mult = 1.5;
      if (self.element === '水' && target.element === '火') mult = 1.5;

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

  // --- 4. NetworkManager ---
  class NetworkManager {
    constructor() {
      this.roomCode = null;
      this.isHost = false;
      this.peer = null;
      this.connection = null;
      this.onMessageCallback = null;
      this.isConnected = false;
    }

    static generateRoomCode() {
      return Math.floor(1000 + Math.random() * 9000).toString();
    }

    createRoom(code, myDeck, onSuccess, onError) {
      this.roomCode = code;
      this.isHost = true;
      this.myDeck = myDeck;
      this.disconnect();

      const peerId = `bcbtl_room_${code}`;

      if (typeof window.Peer !== 'undefined') {
        try {
          this.peer = new window.Peer(peerId, { debug: 1 });
          this.peer.on('open', (id) => { if (onSuccess) onSuccess(id); });
          this.peer.on('connection', (conn) => {
            this.connection = conn;
            this.isConnected = true;
            this._setupConn(conn);
          });
          this.peer.on('error', () => {
            if (onError) onError("すでに使われているコードです。");
          });
        } catch (e) {}
      }
    }

    joinRoom(code, myDeck, onSuccess, onError) {
      this.roomCode = code;
      this.isHost = false;
      this.myDeck = myDeck;
      this.disconnect();

      const peerId = `bcbtl_room_${code}`;
      let hasConn = false;

      const timeoutId = setTimeout(() => {
        if (!hasConn && !this.isConnected) {
          this.disconnect();
          if (onError) onError("へやが見つかりませんでした。ルームコードを確認してください。");
        }
      }, 5000);

      if (typeof window.Peer !== 'undefined') {
        try {
          this.peer = new window.Peer({ debug: 1 });
          this.peer.on('open', () => {
            const conn = this.peer.connect(peerId, { reliable: true });
            this.connection = conn;

            conn.on('open', () => {
              hasConn = true;
              clearTimeout(timeoutId);
              this.isConnected = true;
              this._setupConn(conn);
              this.send({ type: 'JOIN_REQUEST', guestDeck: myDeck });
              if (onSuccess) onSuccess();
            });

            conn.on('error', () => {
              clearTimeout(timeoutId);
              this.disconnect();
              if (onError) onError("へやが見つかりませんでした。");
            });
          });
          this.peer.on('error', () => {
            clearTimeout(timeoutId);
            this.disconnect();
            if (onError) onError("へやが見つかりませんでした。");
          });
        } catch (e) {}
      }
    }

    _setupConn(conn) {
      conn.on('data', (data) => {
        if (data.type === 'JOIN_REQUEST' && this.isHost) {
          this.send({ type: 'JOIN_ACCEPT', hostDeck: this.myDeck });
        }
        if (this.onMessageCallback) this.onMessageCallback(data);
      });
    }

    send(data) {
      if (this.connection && this.connection.open) {
        this.connection.send(data);
      }
    }

    disconnect() {
      if (this.connection) { try { this.connection.close(); } catch(e){} this.connection = null; }
      if (this.peer) { try { this.peer.destroy(); } catch(e){} this.peer = null; }
      this.isConnected = false;
    }
  }

  // --- 5. App State & Router & Handlers ---
  let currentScreen = 'SCR-01';
  let activeBattle = null;
  let scannedCard = null;
  let selectedCardForDetail = null;
  let matchMode = '1p';
  let isOnlineMatch = false;
  let myTurnAction = null;
  let myTurnItemIndex = 0;
  let oppTurnAction = null;
  let oppTurnItemIndex = 0;
  let collectionSubTab = 'all';
  let network = new NetworkManager();

  let mediaStream = null;
  let scanIntervalId = null;
  let barcodeDetector = null;

  if ('BarcodeDetector' in window) {
    try {
      barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'qr_code'] });
    } catch (e) {}
  }

  function switchScreen(screenId, isFromPopstate = false) {
    if (screenId !== 'SCR-02') {
      stopCamera();
    }

    currentScreen = screenId;

    if (!isFromPopstate) {
      try {
        history.pushState({ screen: screenId }, "", "");
      } catch (e) {}
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }

    if (screenId === 'SCR-01') renderHome();
    else if (screenId === 'SCR-02') startCamera();
    else if (screenId === 'SCR-04') renderCollection();
    else if (screenId === 'SCR-05') renderLobby();
  }

  window.appSwitchScreen = switchScreen;

  window.addEventListener('popstate', (event) => {
    if (currentScreen === 'SCR-01') {
      const exitConfirm = confirm("⚡ バーコードバトラーを しゅうりょうしますか？");
      if (!exitConfirm) {
        try { history.pushState({ screen: 'SCR-01' }, "", ""); } catch (e) {}
      }
    } else {
      const prevScreen = (event.state && event.state.screen) ? event.state.screen : 'SCR-01';
      switchScreen(prevScreen, true);
    }
  });

  async function startCamera() {
    const video = document.getElementById('scan-video');
    const statusMsg = document.getElementById('camera-status-msg');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMsg) statusMsg.textContent = "※ お使いのブラウザは カメラに 対応していません（下のテストボタンをご利用ください）";
      return;
    }

    try {
      if (statusMsg) statusMsg.textContent = "カメラを き動しています...";
      const constraints = {
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };

      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (video) {
        video.srcObject = mediaStream;
        await video.play();
      }

      if (statusMsg) statusMsg.textContent = "バーコードを わくの中に あわせよう！";
      startScanLoop();

    } catch (err) {
      console.error("Camera error:", err);
      if (statusMsg) statusMsg.textContent = "⚠️ カメラのきょかが ありません。下のテストボタンをご利用ください。";
    }
  }

  window.appStartCamera = startCamera;

  function stopCamera() {
    if (scanIntervalId) {
      clearInterval(scanIntervalId);
      scanIntervalId = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    const video = document.getElementById('scan-video');
    if (video) video.srcObject = null;
  }

  function startScanLoop() {
    const video = document.getElementById('scan-video');
    if (!video) return;

    scanIntervalId = setInterval(async () => {
      if (!video.videoWidth || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      if (barcodeDetector) {
        try {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const detectedCode = barcodes[0].rawValue;
            stopCamera();
            processScanResult(detectedCode);
          }
        } catch (e) {}
      }
    }, 300);
  }

  function processScanResult(codeStr) {
    scannedCard = BarcodeEngine.generateFromBarcode(codeStr);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const resultBox = document.getElementById('scan-result-card');
    if (resultBox) {
      if (scannedCard.type === 'character') {
        const svg = getCharacterSpriteSvg(scannedCard);
        resultBox.innerHTML = `
          <div style="font-size: 1.1rem; color: var(--accent-gold); font-weight: 900; margin-bottom: 4px;">
            ✨ ${scannedCard.rarity} ゲット！
          </div>
          <div class="sprite-container" style="color: var(--element-${scannedCard.element})">
            ${svg}
          </div>
          <div class="char-name">${scannedCard.name}</div>
          <div><span class="element-tag element-${scannedCard.element}">${scannedCard.element}</span> <span class="rarity-tag">${scannedCard.rarity}</span></div>
          <div style="font-size: 0.85rem; line-height: 1.4; color: var(--text-muted); margin-top: 4px;">
            HP: ${scannedCard.hp} / ATK: ${scannedCard.atk} / DEF: ${scannedCard.def} / SPD: ${scannedCard.spd}<br>
            ✨ 必殺技: 【${scannedCard.skill.name}】
          </div>
        `;
      } else {
        resultBox.innerHTML = `
          <div style="font-size: 1.1rem; color: var(--accent-gold); font-weight: 900; margin-bottom: 4px;">
            🎁 きょうかアイテム ゲット！ (${scannedCard.rarity})
          </div>
          <div style="width:70px; height:70px; margin: 4px auto;">
            ${scannedCard.spriteSvg}
          </div>
          <div class="char-name" style="color: var(--accent-gold);">${scannedCard.name}</div>
          <div style="font-size: 0.85rem; margin-top: 4px; color: var(--text-muted);">${scannedCard.desc}</div>
        `;
      }
    }

    const memoInput = document.getElementById('scanned-memo-input');
    if (memoInput) memoInput.value = "";

    switchScreen('SCR-03');
  }

  function renderHome() {
    const col = StorageManager.getCollection();
    const badge = document.getElementById('home-count-badge');
    if (badge) badge.textContent = `しょじ ${col.length}/100`;

    const showcase = document.getElementById('home-showcase');
    const deck = StorageManager.getDeck();
    const mainChar = (deck.mainChar && deck.mainChar.type === 'character') ? deck.mainChar : col.find(c => c && c.type === 'character');

    if (mainChar && showcase) {
      const svg = getCharacterSpriteSvg(mainChar);
      showcase.innerHTML = `
        <div class="sprite-container" style="color: var(--element-${mainChar.element})">${svg}</div>
        <div class="char-name">${mainChar.name}</div>
        <div><span class="element-tag element-${mainChar.element}">${mainChar.element}</span> <span class="rarity-tag">${mainChar.rarity}</span></div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">HP: ${mainChar.hp} / ATK: ${mainChar.atk} / DEF: ${mainChar.def} / SPD: ${mainChar.spd}</div>
      `;
    } else if (showcase) {
      showcase.innerHTML = `<div style="color: var(--text-muted); padding: 20px 0;">バーコードを スキャンして<br>キャラを ゲットしよう！</div>`;
    }
  }

  /**
   * ⭐【改善】図鑑での「アイテム3種類」同時ハイライト表示
   */
  function renderCollection() {
    const grid = document.getElementById('collection-grid-container');
    if (!grid) return;
    const rawCol = StorageManager.getCollection();
    const deck = StorageManager.getDeck();
    grid.innerHTML = "";

    let col = rawCol;
    if (collectionSubTab === 'char') {
      col = rawCol.filter(c => c && c.type === 'character');
    } else if (collectionSubTab === 'item') {
      col = rawCol.filter(c => c && c.type === 'item');
    }

    if (col.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/3; text-align: center; color: var(--text-muted); padding: 40px 0;">
        ${collectionSubTab === 'char' ? 'キャラカードが ありません。' : collectionSubTab === 'item' ? 'アイテムカードが ありません。' : 'カードが ありません。スキャンしよう！'}
      </div>`;
      return;
    }

    col.forEach(c => {
      if (!c) return;
      const div = document.createElement('div');
      let slotBadgeHtml = "";
      let isSet = false;

      // ★3つのアイテムスロットすべてを判定・ハイライト
      if (deck.mainChar && deck.mainChar.id === c.id) {
        slotBadgeHtml = `<span class="slot-badge badge-main">⚔️ メイン</span>`;
        isSet = true;
      } else if (deck.subChar1 && deck.subChar1.id === c.id) {
        slotBadgeHtml = `<span class="slot-badge badge-sub1">🛡️ サブ1</span>`;
        isSet = true;
      } else if (deck.subChar2 && deck.subChar2.id === c.id) {
        slotBadgeHtml = `<span class="slot-badge badge-sub2">🛡️ サブ2</span>`;
        isSet = true;
      } else if (deck.itemCard1 && deck.itemCard1.id === c.id) {
        slotBadgeHtml = `<span class="slot-badge badge-item">💊 アイテム1</span>`;
        isSet = true;
      } else if (deck.itemCard2 && deck.itemCard2.id === c.id) {
        slotBadgeHtml = `<span class="slot-badge badge-item">💊 アイテム2</span>`;
        isSet = true;
      } else if (deck.itemCard3 && deck.itemCard3.id === c.id) {
        slotBadgeHtml = `<span class="slot-badge badge-item">💊 アイテム3</span>`;
        isSet = true;
      }

      div.className = `card-item ${c.type === 'item' ? 'item-card' : ''} ${isSet ? 'is-deck-set' : ''}`;
      
      const sprite = (c.type === 'character') ? getCharacterSpriteSvg(c) : (c.spriteSvg || '🎁');

      div.innerHTML = `
        ${slotBadgeHtml}
        <div class="mini-sprite" style="color: var(--element-${c.element || '火'})">${sprite}</div>
        <div style="font-weight: 800; font-size: 0.8rem; margin-top: 4px;">${c.name}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
          ${c.type === 'character' ? `[${c.rarity}] HP:${c.hp}<br>A:${c.atk} D:${c.def}` : c.desc}
        </div>
      `;

      div.onclick = function() {
        window.appOpenDetailModal(c);
      };

      grid.appendChild(div);
    });

    renderDeckSlots();
  }

  window.appSelectSubTab = function(subType) {
    collectionSubTab = subType;
    const btnAll = document.getElementById('sub-tab-all');
    const btnChar = document.getElementById('sub-tab-char');
    const btnItem = document.getElementById('sub-tab-item');

    btnAll?.classList.remove('active');
    btnChar?.classList.remove('active');
    btnItem?.classList.remove('active');

    if (subType === 'char') btnChar?.classList.add('active');
    else if (subType === 'item') btnItem?.classList.add('active');
    else btnAll?.classList.add('active');

    renderCollection();
  };

  function openDetailModal(card) {
    if (!card) return;
    selectedCardForDetail = card;
    const content = document.getElementById('detail-card-content');
    const modal = document.getElementById('detail-modal');

    const btnMain = document.getElementById('btn-set-main');
    const btnSub1 = document.getElementById('btn-set-sub1');
    const btnSub2 = document.getElementById('btn-set-sub2');
    const btnItem1 = document.getElementById('btn-set-item1');
    const btnItem2 = document.getElementById('btn-set-item2');
    const btnItem3 = document.getElementById('btn-set-item3');

    if (card.type === 'character') {
      if (btnMain) btnMain.style.display = 'block';
      if (btnSub1) btnSub1.style.display = 'block';
      if (btnSub2) btnSub2.style.display = 'block';
      if (btnItem1) btnItem1.style.display = 'none';
      if (btnItem2) btnItem2.style.display = 'none';
      if (btnItem3) btnItem3.style.display = 'none';

      const svg = getCharacterSpriteSvg(card);
      content.innerHTML = `
        <div style="font-size: 1rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 4px;">【キャラ能力詳細】</div>
        <div class="sprite-container" style="color: var(--element-${card.element}); margin: 0 auto 6px auto; width: 70px; height: 70px;">${svg}</div>
        <div style="font-size: 1.05rem; font-weight: 800;">${card.name}</div>
        <div style="margin: 4px 0;"><span class="element-tag element-${card.element}">${card.element}</span> <span class="rarity-tag">${card.rarity}</span></div>
        <div style="font-size: 0.8rem; color: var(--text-muted); text-align: left; background: var(--surface-card); padding: 8px; border-radius: 8px; line-height: 1.4;">
          ❤️ 体力 (HP): ${card.hp}<br>
          ⚔️ 攻撃力 (ATK): ${card.atk}<br>
          🛡️ 防御力 (DEF): ${card.def}<br>
          ⚡ 素早さ (SPD): ${card.spd}<br>
          ✨ 必殺技: 【${card.skill?.name || "ギガブレイク"}】<br>
          📝 メモ: ${card.memo || "メモなし"}
        </div>
      `;
    } else {
      if (btnMain) btnMain.style.display = 'none';
      if (btnSub1) btnSub1.style.display = 'none';
      if (btnSub2) btnSub2.style.display = 'none';
      if (btnItem1) btnItem1.style.display = 'block';
      if (btnItem2) btnItem2.style.display = 'block';
      if (btnItem3) btnItem3.style.display = 'block';

      content.innerHTML = `
        <div style="font-size: 1rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 4px;">【アイテム効果詳細】</div>
        <div style="width: 70px; height: 70px; margin: 4px auto;">${card.spriteSvg || '🎁'}</div>
        <div style="font-size: 1.05rem; font-weight: 800; color: var(--accent-gold);">${card.name} (${card.rarity})</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); text-align: left; background: var(--surface-card); padding: 8px; border-radius: 8px; margin-top: 6px; line-height: 1.4;">
          💊 効果: ${card.desc}<br>
          📝 メモ: ${card.memo || "メモなし"}
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  }

  window.appOpenDetailModal = openDetailModal;

  function renderDeckSlots() {
    const deck = StorageManager.getDeck();
    const m = document.getElementById('slot-content-main');
    const s1 = document.getElementById('slot-content-sub1');
    const s2 = document.getElementById('slot-content-sub2');
    const item1 = document.getElementById('slot-content-item1');
    const item2 = document.getElementById('slot-content-item2');
    const item3 = document.getElementById('slot-content-item3');

    if (m) m.textContent = deck.mainChar ? `${deck.mainChar.name} (HP:${deck.mainChar.hp} ATK:${deck.mainChar.atk} DEF:${deck.mainChar.def})` : "未セット";
    if (s1) s1.textContent = deck.subChar1 ? `${deck.subChar1.name} (HP:${deck.subChar1.hp} ATK:${deck.subChar1.atk} DEF:${deck.subChar1.def})` : "未セット";
    if (s2) s2.textContent = deck.subChar2 ? `${deck.subChar2.name} (HP:${deck.subChar2.hp} ATK:${deck.subChar2.atk} DEF:${deck.subChar2.def})` : "未セット";
    if (item1) item1.textContent = deck.itemCard1 ? `${deck.itemCard1.name} (${deck.itemCard1.desc})` : "未セット";
    if (item2) item2.textContent = deck.itemCard2 ? `${deck.itemCard2.name} (${deck.itemCard2.desc})` : "未セット";
    if (item3) item3.textContent = deck.itemCard3 ? `${deck.itemCard3.name} (${deck.itemCard3.desc})` : "未セット";
  }

  function renderLobby() {
    const selectView = document.getElementById('lobby-select-view');
    const waitView = document.getElementById('lobby-host-wait-view');
    if (selectView) selectView.style.display = 'block';
    if (waitView) waitView.style.display = 'none';
  }

  window.appSelectTab = function(type) {
    const tabCol = document.getElementById('tab-btn-collection');
    const tabDeck = document.getElementById('tab-btn-deck');
    const viewCol = document.getElementById('view-collection-tab');
    const viewDeck = document.getElementById('view-deck-tab');

    if (type === 'col') {
      tabCol?.classList.add('active');
      tabDeck?.classList.remove('active');
      if (viewCol) viewCol.style.display = 'flex';
      if (viewDeck) viewDeck.style.display = 'none';
      renderCollection();
    } else {
      tabDeck?.classList.add('active');
      tabCol?.classList.remove('active');
      if (viewDeck) viewDeck.style.display = 'flex';
      if (viewCol) viewCol.style.display = 'none';
      renderDeckSlots();
    }
  };

  window.appSetMode = function(mode) {
    matchMode = mode;
    const btn1p = document.getElementById('btn-mode-1p');
    const btn3p = document.getElementById('btn-mode-3p');
    if (mode === '1p') {
      btn1p?.classList.add('active');
      btn3p?.classList.remove('active');
    } else {
      btn3p?.classList.add('active');
      btn1p?.classList.remove('active');
    }
  };

  window.appCreateRoom = function() {
    const code = NetworkManager.generateRoomCode();
    const deck = StorageManager.getDeck();
    isOnlineMatch = true;

    const selectView = document.getElementById('lobby-select-view');
    const waitView = document.getElementById('lobby-host-wait-view');
    if (selectView) selectView.style.display = 'none';
    if (waitView) waitView.style.display = 'block';

    const codeDisp = document.getElementById('host-room-code');
    if (codeDisp) codeDisp.textContent = code;

    network.createRoom(code, deck, () => {}, (err) => { alert(err); renderLobby(); });
    
    network.onMessageCallback = (data) => {
      if (data.type === 'JOIN_REQUEST') {
        startBattle(false, data.guestDeck);
      } else if (data.type === 'TURN_ACTION') {
        oppTurnAction = data.action;
        oppTurnItemIndex = data.itemIndex || 0;
        checkAndExecuteOnlineTurn();
      }
    };
  };

  window.appCancelHost = function() {
    network.disconnect();
    isOnlineMatch = false;
    renderLobby();
  };

  window.appJoinRoom = function() {
    const input = document.getElementById('input-guest-code');
    const codeStr = input ? input.value.trim() : "";
    const deck = StorageManager.getDeck();

    if (!codeStr || codeStr.length !== 4) {
      alert("⚠️ 4けたの ルームコードを 正しく入力してください (例: 7821)");
      return;
    }

    const btnJoin = document.getElementById('btn-join-room');
    if (btnJoin) { btnJoin.disabled = true; btnJoin.textContent = "🌀 せつぞく中..."; }

    isOnlineMatch = true;

    network.joinRoom(codeStr, deck, () => {}, (errMsg) => {
      if (btnJoin) { btnJoin.disabled = false; btnJoin.textContent = "さんかする"; }
      alert(`❌ ${errMsg}`);
      isOnlineMatch = false;
    });

    network.onMessageCallback = (data) => {
      if (data.type === 'JOIN_ACCEPT') {
        if (btnJoin) { btnJoin.disabled = false; btnJoin.textContent = "さんかする"; }
        startBattle(false, data.hostDeck);
      } else if (data.type === 'TURN_RESULT') {
        applyHostTurnResultToGuest(data);
      }
    };
  };

  function setBattleButtonsDisabled(disabled) {
    const ids = ['btn-cmd-attack', 'btn-cmd-skill', 'btn-cmd-guard', 'btn-cmd-item'];
    ids.forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = disabled;
    });
  }

  function checkAndExecuteOnlineTurn() {
    if (!isOnlineMatch || !activeBattle || activeBattle.isOver) return;

    if (network.isHost && myTurnAction && oppTurnAction) {
      const turnLog = activeBattle.processTurn(myTurnAction, myTurnItemIndex, oppTurnAction, oppTurnItemIndex);
      
      myTurnAction = null;
      oppTurnAction = null;

      renderBattle();
      appendBattleLog(turnLog);

      const resultPayload = {
        type: 'TURN_RESULT',
        turnLog: turnLog,
        hostHp: activeBattle.player.currentHp,
        hostMaxHp: activeBattle.player.maxHp,
        hostSp: activeBattle.player.sp,
        guestHp: activeBattle.enemy.currentHp,
        guestMaxHp: activeBattle.enemy.maxHp,
        guestSp: activeBattle.enemy.sp,
        isOver: activeBattle.isOver,
        winner: activeBattle.winner
      };

      network.send(resultPayload);

      if (activeBattle.isOver) {
        setTimeout(() => {
          alert(activeBattle.winner === 'player' ? '🎉 あなたの しょうり！' : '💧 あなたの まけ...');
          isOnlineMatch = false;
          network.disconnect();
          switchScreen('SCR-05');
        }, 1000);
      } else {
        setBattleButtonsDisabled(false);
      }
    }
  }

  function applyHostTurnResultToGuest(data) {
    if (!activeBattle) return;

    activeBattle.player.currentHp = data.guestHp;
    activeBattle.player.sp = data.guestSp;
    activeBattle.enemy.currentHp = data.hostHp;
    activeBattle.enemy.sp = data.hostSp;
    activeBattle.isOver = data.isOver;

    renderBattle();
    appendBattleLog(data.turnLog);
    setBattleButtonsDisabled(false);

    if (data.isOver) {
      const isGuestWin = (data.winner === 'enemy');
      setTimeout(() => {
        alert(isGuestWin ? '🎉 あなたの しょうり！' : '💧 あなたの まけ...');
        isOnlineMatch = false;
        network.disconnect();
        switchScreen('SCR-05');
      }, 1000);
    }
  }

  window.appStartCpuBattle = function() {
    isOnlineMatch = false;
    startBattle(true, null);
  };

  function startBattle(isCpu = true, oppDeck = null) {
    const deck = StorageManager.getDeck();
    const defaultChar1 = BarcodeEngine.generateFromBarcode("4901234567890");

    let playerMain = (deck.mainChar && deck.mainChar.type === 'character') ? deck.mainChar : defaultChar1;
    let playerTeam = [playerMain];

    if (matchMode === '3p') {
      playerTeam.push((deck.subChar1 && deck.subChar1.type === 'character') ? deck.subChar1 : BarcodeEngine.generateFromBarcode("4901111111111"));
      playerTeam.push((deck.subChar2 && deck.subChar2.type === 'character') ? deck.subChar2 : BarcodeEngine.generateFromBarcode("4902222222222"));
    }

    // ★3つのアイテムを配列で渡す
    const playerItems = [deck.itemCard1, deck.itemCard2, deck.itemCard3].filter(Boolean);

    let enemyTeam = [];
    let enemyItems = [];

    if (isCpu) {
      enemyTeam.push(BarcodeEngine.generateFromBarcode(BarcodeEngine.getRandomBarcode()));
      if (matchMode === '3p') {
        enemyTeam.push(BarcodeEngine.generateFromBarcode(BarcodeEngine.getRandomBarcode()));
        enemyTeam.push(BarcodeEngine.generateFromBarcode(BarcodeEngine.getRandomBarcode()));
      }
      // 敵CPUのアイテム3つ生成
      enemyItems.push(BarcodeEngine.generateFromBarcode("4908888777766"));
      enemyItems.push(BarcodeEngine.generateFromBarcode("4908888777777"));
      enemyItems.push(BarcodeEngine.generateFromBarcode("4908888777788"));

    } else if (oppDeck) {
      let oppMain = (oppDeck.mainChar && oppDeck.mainChar.type === 'character') ? oppDeck.mainChar : BarcodeEngine.generateFromBarcode("4909876543210");
      enemyTeam.push(oppMain);
      if (matchMode === '3p') {
        enemyTeam.push((oppDeck.subChar1 && oppDeck.subChar1.type === 'character') ? oppDeck.subChar1 : BarcodeEngine.generateFromBarcode("4905555555555"));
        enemyTeam.push((oppDeck.subChar2 && oppDeck.subChar2.type === 'character') ? oppDeck.subChar2 : BarcodeEngine.generateFromBarcode("4906666666666"));
      }
      enemyItems = [oppDeck.itemCard1, oppDeck.itemCard2, oppDeck.itemCard3].filter(Boolean);
    } else {
      enemyTeam.push(BarcodeEngine.generateFromBarcode(BarcodeEngine.getRandomBarcode()));
    }

    activeBattle = new BattleEngine(playerTeam, playerItems, enemyTeam, enemyItems, matchMode);
    myTurnAction = null;
    oppTurnAction = null;

    const logBox = document.getElementById('battle-log');
    if (logBox) logBox.innerHTML = `<div>⚔️ ${isOnlineMatch ? '対戦相手と' : 'CPUとの'} バトルが はじまった！ (${matchMode === '3p' ? '3Pチーム戦 [20ターン]' : '1P勝負 [10ターン]'})</div>`;

    renderBattle();
    switchScreen('SCR-06');
  }

  function renderBattle() {
    if (!activeBattle) return;
    const b = activeBattle;
    const p = b.player;
    const e = b.enemy;

    const pName = document.getElementById('p-name');
    const pHpNum = document.getElementById('p-hp-num');
    const pHpBar = document.getElementById('p-hp-bar');
    const pSpBar = document.getElementById('p-sp-bar');
    const pSprite = document.getElementById('p-sprite');

    if (pName) pName.textContent = p.name;
    if (pHpNum) pHpNum.textContent = `${Math.max(0, p.currentHp)}/${p.maxHp}`;
    if (pHpBar) pHpBar.style.width = `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%`;
    if (pSpBar) pSpBar.style.width = `${p.sp}%`;
    if (pSprite) {
      pSprite.innerHTML = getCharacterSpriteSvg(p);
      pSprite.style.color = `var(--element-${p.element})`;
    }

    const eName = document.getElementById('e-name');
    const eHpNum = document.getElementById('e-hp-num');
    const eHpBar = document.getElementById('e-hp-bar');
    const eSpBar = document.getElementById('e-sp-bar');
    const eSprite = document.getElementById('e-sprite');

    if (eName) eName.textContent = e.name;
    if (eHpNum) eHpNum.textContent = `${Math.max(0, e.currentHp)}/${e.maxHp}`;
    if (eHpBar) eHpBar.style.width = `${Math.max(0, (e.currentHp / e.maxHp) * 100)}%`;
    if (eSpBar) eSpBar.style.width = `${e.sp}%`;
    if (eSprite) {
      eSprite.innerHTML = getCharacterSpriteSvg(e);
      eSprite.style.color = `var(--element-${e.element})`;
    }

    const btnAttack = document.getElementById('btn-cmd-attack');
    const btnGuard = document.getElementById('btn-cmd-guard');
    if (btnAttack) { btnAttack.disabled = false; btnAttack.style.opacity = "1.0"; }
    if (btnGuard) { btnGuard.disabled = false; btnGuard.style.opacity = "1.0"; }

    const btnSkill = document.getElementById('btn-cmd-skill');
    if (btnSkill) {
      btnSkill.disabled = (p.sp < 100);
      btnSkill.style.opacity = (p.sp < 100) ? "0.4" : "1.0";
    }

    const btnItem = document.getElementById('btn-cmd-item');
    if (btnItem) {
      const uses = b.playerItemUsesLeft;
      const isItemUsable = (uses > 0);
      btnItem.disabled = !isItemUsable;
      btnItem.style.opacity = isItemUsable ? "1.0" : "0.4";
      btnItem.textContent = isItemUsable ? `💊 アイテム (${uses}/3)` : `💊 アイテム (終了)`;
    }
  }

  // ★バトル中アイテム選択モーダルのオープン
  function openBattleItemSelectModal() {
    if (!activeBattle || activeBattle.playerItemUsesLeft <= 0) return;
    const modal = document.getElementById('battle-item-modal');
    const listContainer = document.getElementById('battle-item-list');
    if (!modal || !listContainer) return;

    listContainer.innerHTML = "";
    activeBattle.playerItems.forEach((item, idx) => {
      const isUsed = activeBattle.playerItemUsed[idx];
      const btn = document.createElement('button');
      btn.className = `btn ${isUsed ? 'btn-dark' : 'btn-gold'}`;
      btn.disabled = isUsed;
      btn.style.margin = "4px 0";
      btn.style.minHeight = "44px";
      btn.style.fontSize = "0.85rem";
      btn.innerHTML = `${isUsed ? '❌ (使用済) ' : '💊 '}${item.name} <br><span style="font-size:0.75rem;">${item.desc}</span>`;
      btn.onclick = () => {
        modal.classList.remove('active');
        executePlayerAction('item', idx);
      };
      listContainer.appendChild(btn);
    });

    modal.classList.add('active');
  }

  function handleAction(act) {
    if (!activeBattle || activeBattle.isOver) return;

    if (act === 'item') {
      if (activeBattle.playerItems.length === 0) {
        alert("⚠️ デッキに アイテムカードが セットされていません！");
        return;
      }
      if (activeBattle.playerItemUsesLeft <= 0) {
        alert("⚠️ アイテムはすべて 使用済みです！");
        return;
      }
      openBattleItemSelectModal();
      return;
    }

    if (act === 'skill') {
      if (activeBattle.player.sp < 100) {
        alert("⚠️ ひっさつ技は SPゲージが 100% になってから つかえます！");
        return;
      }
    }

    executePlayerAction(act, 0);
  }

  function executePlayerAction(act, itemIndex = 0) {
    if (isOnlineMatch) {
      myTurnAction = act;
      myTurnItemIndex = itemIndex;
      setBattleButtonsDisabled(true);

      const logBox = document.getElementById('battle-log');
      if (logBox) {
        const div = document.createElement('div');
        div.style.color = "var(--secondary-cyan)";
        div.textContent = "🌀 あいての コマンド選択を まっています...";
        logBox.appendChild(div);
        logBox.scrollTop = logBox.scrollHeight;
      }

      if (network.isHost) {
        checkAndExecuteOnlineTurn();
      } else {
        network.send({ type: 'TURN_ACTION', action: act, itemIndex: itemIndex });
      }

    } else {
      const turnLog = activeBattle.processTurn(act, itemIndex);
      renderBattle();
      appendBattleLog(turnLog);

      if (activeBattle.isOver) {
        setTimeout(() => {
          alert(activeBattle.winner === 'player' ? '🎉 あなたの しょうり！' : '💧 あなたの まけ...');
          switchScreen('SCR-05');
        }, 800);
      }
    }
  }

  function appendBattleLog(turnLog) {
    const logBox = document.getElementById('battle-log');
    if (!logBox || !turnLog) return;
    turnLog.actions.forEach(a => {
      const d = document.createElement('div');
      d.textContent = a.message;
      logBox.appendChild(d);
    });
    logBox.scrollTop = logBox.scrollHeight;
  }

  function initApp() {
    console.log("Initializing Barcode Battler v2.3.0 Official Edition...");
    try {
      StorageManager.migrateCollectionData();
    } catch (e) {
      console.error("Data migration error:", e);
    }

    try {
      history.replaceState({ screen: 'SCR-01' }, "", "");
    } catch (e) {}

    document.getElementById('btn-nav-scan')?.addEventListener('click', () => switchScreen('SCR-02'));
    document.getElementById('btn-nav-deck')?.addEventListener('click', () => switchScreen('SCR-04'));
    document.getElementById('btn-nav-battle')?.addEventListener('click', () => switchScreen('SCR-05'));

    document.querySelectorAll('.btn-back-home').forEach(b => {
      b.addEventListener('click', () => switchScreen('SCR-01'));
    });

    document.getElementById('btn-start-camera')?.addEventListener('click', () => startCamera());
    document.getElementById('btn-manual-scan')?.addEventListener('click', () => {
      const input = document.getElementById('input-manual-barcode');
      if (input && input.value) {
        stopCamera();
        processScanResult(input.value);
      }
    });

    document.getElementById('btn-save-scanned')?.addEventListener('click', () => {
      if (scannedCard) {
        const memoInput = document.getElementById('scanned-memo-input');
        if (memoInput && memoInput.value) scannedCard.memo = memoInput.value;
        StorageManager.saveToCollection(scannedCard);
        alert(`【${scannedCard.name}】を ずかんに ほぞんしました！`);
        switchScreen('SCR-04');
      }
    });

    document.getElementById('btn-edit-memo')?.addEventListener('click', () => {
      if (!selectedCardForDetail) return;
      const newMemo = prompt("このカードのメモをへんしゅう (例: おかしの箱):", selectedCardForDetail.memo || "");
      if (newMemo !== null) {
        StorageManager.updateMemo(selectedCardForDetail.id, newMemo);
        selectedCardForDetail.memo = newMemo;
        alert("メモを こうしんしました！");
        renderCollection();
        openDetailModal(selectedCardForDetail);
      }
    });

    document.getElementById('btn-delete-card')?.addEventListener('click', () => {
      if (!selectedCardForDetail) return;
      const cardName = selectedCardForDetail.name;
      const delConfirm = confirm(`⚠️ ほんとうに【${cardName}】を ずかんから さくじょしますか？\n（※セット中の場合は デッキからも かいじょされます）`);
      if (delConfirm) {
        StorageManager.deleteFromCollection(selectedCardForDetail.id);
        alert(`【${cardName}】を さくじょしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderCollection();
        renderHome();
      }
    });

    // キャラクター枠セット
    document.getElementById('btn-set-main')?.addEventListener('click', () => {
      if (selectedCardForDetail && StorageManager.setDeckSlot('mainChar', selectedCardForDetail) !== false) {
        alert(`【${selectedCardForDetail.name}】を メインにセットしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderDeckSlots();
        renderCollection();
        renderHome();
      }
    });
    document.getElementById('btn-set-sub1')?.addEventListener('click', () => {
      if (selectedCardForDetail && StorageManager.setDeckSlot('subChar1', selectedCardForDetail) !== false) {
        alert(`【${selectedCardForDetail.name}】を サブ1にセットしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderDeckSlots();
        renderCollection();
      }
    });
    document.getElementById('btn-set-sub2')?.addEventListener('click', () => {
      if (selectedCardForDetail && StorageManager.setDeckSlot('subChar2', selectedCardForDetail) !== false) {
        alert(`【${selectedCardForDetail.name}】を サブ2にセットしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderDeckSlots();
        renderCollection();
      }
    });

    // ★アイテム3枠セット
    document.getElementById('btn-set-item1')?.addEventListener('click', () => {
      if (selectedCardForDetail && StorageManager.setDeckSlot('itemCard1', selectedCardForDetail) !== false) {
        alert(`【${selectedCardForDetail.name}】を アイテム1にセットしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderDeckSlots();
        renderCollection();
      }
    });
    document.getElementById('btn-set-item2')?.addEventListener('click', () => {
      if (selectedCardForDetail && StorageManager.setDeckSlot('itemCard2', selectedCardForDetail) !== false) {
        alert(`【${selectedCardForDetail.name}】を アイテム2にセットしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderDeckSlots();
        renderCollection();
      }
    });
    document.getElementById('btn-set-item3')?.addEventListener('click', () => {
      if (selectedCardForDetail && StorageManager.setDeckSlot('itemCard3', selectedCardForDetail) !== false) {
        alert(`【${selectedCardForDetail.name}】を アイテム3にセットしました！`);
        document.getElementById('detail-modal')?.classList.remove('active');
        renderDeckSlots();
        renderCollection();
      }
    });

    document.querySelectorAll('.btn-demo-barcode').forEach(b => {
      b.addEventListener('click', (e) => {
        const code = e.target.getAttribute('data-code');
        stopCamera();
        processScanResult(code);
      });
    });

    document.getElementById('btn-cmd-attack')?.addEventListener('click', () => handleAction('attack'));
    document.getElementById('btn-cmd-skill')?.addEventListener('click', () => handleAction('skill'));
    document.getElementById('btn-cmd-guard')?.addEventListener('click', () => handleAction('guard'));
    document.getElementById('btn-cmd-item')?.addEventListener('click', () => handleAction('item'));

    document.getElementById('btn-close-battle-item')?.addEventListener('click', () => {
      document.getElementById('battle-item-modal')?.classList.remove('active');
    });

    renderHome();
    console.log("Barcode Battler v2.3.0 Ready!");
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 1);
  } else {
    document.addEventListener('DOMContentLoaded', initApp);
  }

})();
