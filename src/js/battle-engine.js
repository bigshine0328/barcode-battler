/**
 * Barcode Battler - Battle Engine Module (v2.3.0 3 Items Choice Support)
 */

export class BattleEngine {
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
