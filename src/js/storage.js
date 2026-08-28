/**
 * Barcode Battler - Storage Manager Module (v2.3.0 3 Item Slots & FIFO)
 */

import { BarcodeEngine } from './barcode-engine.js';

const STORAGE_KEY_COLLECTION = "barcode_battler_collection";
const STORAGE_KEY_DECK = "barcode_battler_deck";

export class StorageManager {
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

      let changed = false;
      const updatedCollection = collection.map(card => {
        if (card && card.type === 'character') {
          if (card.level === undefined || card.exp === undefined || card.baseHp === undefined) {
            changed = true;
            card.level = card.level || 1;
            card.exp = card.exp || 0;
            card.baseHp = card.baseHp || card.maxHp || card.hp || 1200;
            card.baseAtk = card.baseAtk || card.atk || 180;
            card.baseDef = card.baseDef || card.def || 80;
            card.baseSpd = card.baseSpd || card.spd || 50;
          }
        }
        return card;
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(updatedCollection));
      }
    } catch (e) {}
  }

  static isCollectionFull() {
    return this.getCollection().length >= 100;
  }

  static saveToCollection(card) {
    const collection = this.getCollection();
    const existingIndex = collection.findIndex(c => c.id === card.id);
    if (existingIndex >= 0) {
      collection[existingIndex] = card;
    } else {
      if (collection.length >= 100) {
        collection.shift(); // 100枚FIFO
      }
      collection.push(card);
    }
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
    } catch (e) {}
  }

  static replaceCardInCollection(deleteCardId, newCard) {
    this.deleteFromCollection(deleteCardId);
    this.saveToCollection(newCard);
  }

  static deleteFromCollection(cardId) {
    let collection = this.getCollection();
    const target = collection.find(c => c.id === cardId);
    if (!target) return false;

    collection = collection.filter(c => c.id !== cardId);
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
    } catch (e) {}

    // デッキにセットされていたら解除 (生のLocalStorageデッキデータを更新)
    try {
      const rawData = localStorage.getItem(STORAGE_KEY_DECK);
      if (rawData) {
        const rawDeck = JSON.parse(rawData);
        let changed = false;
        if (rawDeck.mainChar && rawDeck.mainChar.id === cardId) { rawDeck.mainChar = null; changed = true; }
        if (rawDeck.subChar1 && rawDeck.subChar1.id === cardId) { rawDeck.subChar1 = null; changed = true; }
        if (rawDeck.subChar2 && rawDeck.subChar2.id === cardId) { rawDeck.subChar2 = null; changed = true; }
        if (rawDeck.itemCard1 && rawDeck.itemCard1.id === cardId) { rawDeck.itemCard1 = null; changed = true; }
        if (rawDeck.itemCard2 && rawDeck.itemCard2.id === cardId) { rawDeck.itemCard2 = null; changed = true; }
        if (rawDeck.itemCard3 && rawDeck.itemCard3.id === cardId) { rawDeck.itemCard3 = null; changed = true; }
        if (changed) {
          localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(rawDeck));
        }
      }
    } catch (e) {}

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

    // 各スロットのカードを collection の最新データ（レベル・成長ステータス）で完全同期
    const syncCard = (card) => {
      if (!card || !card.id) return null;
      const found = collection.find(c => c.id === card.id);
      return found || null;
    };

    deck.mainChar = syncCard(deck.mainChar);
    deck.subChar1 = syncCard(deck.subChar1);
    deck.subChar2 = syncCard(deck.subChar2);
    deck.itemCard1 = syncCard(deck.itemCard1);
    deck.itemCard2 = syncCard(deck.itemCard2);
    deck.itemCard3 = syncCard(deck.itemCard3);

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

  // --- バックアップ・リストア機能 (v4.4.0) ---
  static exportBackupData() {
    const collection = this.getCollection();
    const deck = this.getDeck();
    let graphicStyle = 'hybrid';
    try {
      graphicStyle = localStorage.getItem('bb_graphic_style') || 'hybrid';
    } catch (e) {}

    return {
      version: "4.4.0",
      appName: "barcode_battler",
      exportedAt: new Date().toISOString(),
      collection: collection,
      deck: deck,
      settings: {
        graphicStyle: graphicStyle
      }
    };
  }

  static exportBackupJsonFile() {
    const backupData = this.exportBackupData();
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `barcode_battler_backup_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  static exportBackupCodeText() {
    const backupData = this.exportBackupData();
    const jsonStr = JSON.stringify(backupData);
    try {
      if (typeof TextEncoder !== 'undefined' && typeof btoa !== 'undefined') {
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        let binaryStr = "";
        for (let i = 0; i < utf8Bytes.length; i++) {
          binaryStr += String.fromCharCode(utf8Bytes[i]);
        }
        return btoa(binaryStr);
      }
      return jsonStr;
    } catch (e) {
      return jsonStr;
    }
  }

  static validateBackupData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: "データが不正なオブジェクトです。" };
    }
    if (!Array.isArray(data.collection)) {
      return { valid: false, error: "所持カードデータ（collection）が見つかりません。" };
    }
    if (data.collection.length > 100) {
      return { valid: false, error: "カード所持上限（100枚）を超過しています。" };
    }

    for (let i = 0; i < data.collection.length; i++) {
      const card = data.collection[i];
      if (!card || typeof card !== 'object' || !card.id || !card.name || !card.type) {
        return { valid: false, error: `カードデータ(${i + 1}枚目)の形式が不正です。` };
      }
    }

    return { valid: true };
  }

  static importBackupData(backupPayload) {
    const val = this.validateBackupData(backupPayload);
    if (!val.valid) {
      return { success: false, message: val.error || "データ検証エラー", count: 0 };
    }

    try {
      const collection = backupPayload.collection.slice(0, 100);
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));

      this.migrateCollectionData();

      if (backupPayload.deck && typeof backupPayload.deck === 'object') {
        localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(backupPayload.deck));
      }

      if (backupPayload.settings && backupPayload.settings.graphicStyle) {
        localStorage.setItem('bb_graphic_style', backupPayload.settings.graphicStyle);
      }

      return {
        success: true,
        message: `バックアップデータを復元しました！（所持数: ${collection.length}枚）`,
        count: collection.length
      };
    } catch (e) {
      return { success: false, message: `復元中にエラーが発生しました: ${e.message}`, count: 0 };
    }
  }

  static importBackupFromCodeText(codeText) {
    if (!codeText || typeof codeText !== 'string') {
      return { success: false, message: "バックアップコードが入力されていません。", count: 0 };
    }

    let parsed = null;
    const trimmed = codeText.trim();

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {}
    }

    if (!parsed) {
      try {
        if (typeof atob !== 'undefined' && typeof TextDecoder !== 'undefined') {
          const binStr = atob(trimmed);
          const bytes = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i);
          }
          const jsonStr = new TextDecoder().decode(bytes);
          parsed = JSON.parse(jsonStr);
        }
      } catch (e) {}
    }

    if (!parsed) {
      return { success: false, message: "無効なバックアップコードです。形式をご確認ください。", count: 0 };
    }

    return this.importBackupData(parsed);
  }

  static importBackupFromFile(file) {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ success: false, message: "ファイルが選択されていません。", count: 0 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsed = JSON.parse(content);
          const res = StorageManager.importBackupData(parsed);
          resolve(res);
        } catch (err) {
          resolve({ success: false, message: "JSONファイルの解析に失敗しました。破損している可能性があります。", count: 0 });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: "ファイルの読み込みに失敗しました。", count: 0 });
      };
      reader.readAsText(file);
    });
  }
}
