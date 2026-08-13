/**
 * Storage Manager Module (Bug Fix & Strict Character Filtering)
 */

const STORAGE_KEY_COLLECTION = "barcode_battler_collection";
const STORAGE_KEY_DECK = "barcode_battler_deck";
const MAX_COLLECTION_SIZE = 100;

export class StorageManager {
  static getCollection() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_COLLECTION);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load collection:", e);
      return [];
    }
  }

  static saveToCollection(card) {
    const collection = this.getCollection();
    const existingIndex = collection.findIndex(c => c.id === card.id);
    if (existingIndex >= 0) {
      collection[existingIndex] = card;
    } else {
      if (collection.length >= MAX_COLLECTION_SIZE) {
        collection.shift();
      }
      collection.push(card);
    }

    try {
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
      return { success: true, count: collection.length };
    } catch (e) {
      console.error("Failed to save card:", e);
      return { success: false, error: e.message };
    }
  }

  static updateMemo(cardId, newMemo) {
    const collection = this.getCollection();
    const target = collection.find(c => c.id === cardId);
    if (target) {
      target.memo = newMemo;
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
      return true;
    }
    return false;
  }

  /**
   * 現在選択中のチームデッキを取得（キャラクター枠には絶対にアイテムカードを混ぜない厳密フィルタ）
   */
  static getDeck() {
    let deck = {
      mainChar: null,
      subChar1: null,
      subChar2: null,
      itemCard: null
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY_DECK);
      if (data) deck = JSON.parse(data);
    } catch (e) {
      console.error("Failed to load deck:", e);
    }

    const collection = this.getCollection();
    
    // 厳密にキャラクターのみを抽出 (type === 'character' かつ hpが存在するもの)
    const validChars = collection.filter(c => c.type === 'character' && typeof c.hp === 'number');
    const validItems = collection.filter(c => c.type === 'item');

    // 不正なカード（アイテムカードがキャラ枠に入っている等）が入っていた場合はクリア
    if (deck.mainChar && deck.mainChar.type !== 'character') deck.mainChar = null;
    if (deck.subChar1 && deck.subChar1.type !== 'character') deck.subChar1 = null;
    if (deck.subChar2 && deck.subChar2.type !== 'character') deck.subChar2 = null;
    if (deck.itemCard && deck.itemCard.type !== 'item') deck.itemCard = null;

    // フォールバック割り当て
    if (!deck.mainChar && validChars.length > 0) deck.mainChar = validChars[0];
    if (!deck.subChar1 && validChars.length > 1) deck.subChar1 = validChars[1];
    if (!deck.subChar2 && validChars.length > 2) deck.subChar2 = validChars[2];
    if (!deck.itemCard && validItems.length > 0) deck.itemCard = validItems[0];

    return deck;
  }

  static setDeckSlot(slotType, card) {
    const deck = this.getDeck();
    
    // バリデーション: キャラ枠にアイテムを入れない
    if ((slotType === 'mainChar' || slotType === 'subChar1' || slotType === 'subChar2') && card.type !== 'character') {
      alert("⚠️ キャラクター枠には アイテムカードを セットできません！");
      return false;
    }
    if (slotType === 'itemCard' && card.type !== 'item') {
      alert("⚠️ アイテム枠には キャラクターを セットできません！");
      return false;
    }

    deck[slotType] = card;
    try {
      localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(deck));
      return true;
    } catch (e) {
      console.error("Failed to set deck slot:", e);
      return false;
    }
  }

  static removeCard(cardId) {
    let collection = this.getCollection();
    collection = collection.filter(c => c.id !== cardId);
    localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
  }
}
