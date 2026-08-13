/**
 * Storage Manager Module (Updated)
 * LocalStorageを使用したキャラクター・チームデッキの保存・管理（最大100体保存、メモ更新、1P/3Pスロットセット機能）
 */

const STORAGE_KEY_COLLECTION = "barcode_battler_collection";
const STORAGE_KEY_DECK = "barcode_battler_deck";
const MAX_COLLECTION_SIZE = 100;

export class StorageManager {
  /**
   * 所持カード一覧を取得
   */
  static getCollection() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_COLLECTION);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load collection:", e);
      return [];
    }
  }

  /**
   * キャラクター/アイテムをコレクションに保存（最大100体制限）
   */
  static saveToCollection(card) {
    const collection = this.getCollection();
    
    // 既存チェック（同じID・バーコードが存在すれば更新）
    const existingIndex = collection.findIndex(c => c.id === card.id);
    if (existingIndex >= 0) {
      collection[existingIndex] = card;
    } else {
      // 100体制限チェック：超過した場合は古いカードを先頭から自動削除
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

  /**
   * メモの更新
   */
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
   * 現在選択中のチームデッキを取得
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
    const chars = collection.filter(c => c.type === 'character');
    const items = collection.filter(c => c.type === 'item');

    // 自動デフォルト割り当て
    if (!deck.mainChar && chars.length > 0) deck.mainChar = chars[0];
    if (!deck.subChar1 && chars.length > 1) deck.subChar1 = chars[1];
    if (!deck.subChar2 && chars.length > 2) deck.subChar2 = chars[2];
    if (!deck.itemCard && items.length > 0) deck.itemCard = items[0];

    return deck;
  }

  /**
   * 特定のスロットにカードをセット
   * @param {string} slotType - 'mainChar' | 'subChar1' | 'subChar2' | 'itemCard'
   * @param {object} card 
   */
  static setDeckSlot(slotType, card) {
    const deck = this.getDeck();
    deck[slotType] = card;
    try {
      localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(deck));
      return true;
    } catch (e) {
      console.error("Failed to set deck slot:", e);
      return false;
    }
  }

  /**
   * コレクションカードの削除
   */
  static removeCard(cardId) {
    let collection = this.getCollection();
    collection = collection.filter(c => c.id !== cardId);
    localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
  }
}
