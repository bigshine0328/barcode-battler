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
}
