// ==========================================
// NanoBanana グラフィックアセット管理モジュール (v4.0.0-dev)
// ==========================================

const MonsterImageMap = {
  "ドラゴン": "src/assets/images/monsters/dragon.jpg",
  "ゴーレム": "src/assets/images/monsters/golem.jpg",
  "レヴィアタン": "src/assets/images/monsters/leviathan.jpg",
  "フェニックス": "src/assets/images/monsters/phoenix.jpg",
  "ファントム": "src/assets/images/monsters/phantom.jpg",
  "ペガサス": "src/assets/images/monsters/pegasus.jpg",
  "ケルベロス": "src/assets/images/monsters/cerberus.jpg"
  // 残り13種族はクォータリセット後に順次追加
};

const ItemImageMap = {
  "えりくさー": "src/assets/images/items/elixir.jpg",
  "はかいのつるぎ": "src/assets/images/items/sword.jpg",
  "いあつのたて": "src/assets/images/items/shield.jpg",
  "ひかりのたびびと": "src/assets/images/items/boots.jpg",
  "びくとりーのたま": "src/assets/images/items/victory_orb.jpg",
  "まほうのばくだん": "src/assets/images/items/bomb.jpg"
  // 残り2種（ふ死鳥の水、おうかんの輝き）は順次追加
};

function getCardGraphic(card) {
  if (!card) return null;
  if (card.type === 'item') {
    for (const [key, path] of Object.entries(ItemImageMap)) {
      if (card.name && card.name.includes(key)) {
        return path;
      }
    }
  } else if (card.type === 'character') {
    for (const [key, path] of Object.entries(MonsterImageMap)) {
      if (card.name && card.name.includes(key)) {
        return path;
      }
    }
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MonsterImageMap, ItemImageMap, getCardGraphic };
}
