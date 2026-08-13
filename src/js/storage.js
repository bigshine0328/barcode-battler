/**
 * Storage Manager Module
 * LocalStorageを使用したキャラクター・デッキの保存・管理（最大100体保存、メモ更新機能）
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
    
    // 既存チェック（同じバーコード・IDが存在すれば更新）
    const existingIndex = collection.findIndex(c => c.id === card.id);
    if (existingIndex >= 0) {
      collection[existingIndex] = card;
    } else {
      // 100体制限チェック：超過した場合は古いカードを先頭から削除
      if (collection.length >= MAX_COLLECTION_SIZE) {
        collection.shift(); // 一番古いものを自動解放
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
   * 現在選択中のデッキを取得
   */
  static getDeck() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DECK);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Failed to load deck:", e);
    }
    
    // デッキ未設定の場合はコレクション内の最初のキャラを自動選択、無ければ初期デフォルトキャラ生成
    const collection = this.getCollection();
    const firstChar = collection.find(c => c.type === "character");
    const firstItem = collection.find(c => c.type === "item");

    return {
      mainChar: firstChar || null,
      subChar1: null,
      subChar2: null,
      itemCard: firstItem || null
    };
  }

  /**
   * デッキを保存
   */
  static saveDeck(deckObj) {
    try {
      localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(deckObj));
      return true;
    } catch (e) {
      console.error("Failed to save deck:", e);
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
