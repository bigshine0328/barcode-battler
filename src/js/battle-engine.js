/**
 * Barcode Battler - Battle Engine (v2.6.0 with Speed-based Character Switching)
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

  get player() { return this.playerTeam[this.playerIndex]; }
  get enemy() { return this.enemyTeam[this.enemyIndex]; }

  getAliveSubIndexes(isPlayer) {
    const team = isPlayer ? this.playerTeam : this.enemyTeam;
    const currentIndex = isPlayer ? this.playerIndex : this.enemyIndex;
    const aliveIndexes = [];
    for (let i = 0; i < team.length; i++) {
      if (i !== currentIndex && team[i].currentHp > 0) {
        aliveIndexes.push(i);
      }
    }
    return aliveIndexes;
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

  processTurn(pAction, pItemIdx = 0, eAction = null, eItemIdx = 0, pSwitchIdx = -1, eSwitchIdx = -1) {
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
      if (this.mode === '3p') {
        const aliveSubs = this.getAliveSubIndexes(false);
        if (aliveSubs.length > 0 && (this.enemy.currentHp < this.enemy.maxHp * 0.35) && Math.random() < 0.3) {
          opts.push('switch');
          eSwitchIdx = aliveSubs[Math.floor(Math.random() * aliveSubs.length)];
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

    const actParams = {
      player: { action: pAction, switchIdx: pSwitchIdx },
      enemy: { action: eAction, switchIdx: eSwitchIdx }
    };

    this._execTurnStep(first, actParams[first], turnLog);
    if (!this._checkWin(turnLog)) {
      this._execTurnStep(second, actParams[second], turnLog);
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

  _execTurnStep(actor, { action, switchIdx }, turnLog) {
    if (this.isOver) return;

    if (action === 'switch') {
      if (actor === 'player') {
        if (switchIdx >= 0 && switchIdx < this.playerTeam.length && this.playerTeam[switchIdx].currentHp > 0 && switchIdx !== this.playerIndex) {
          const oldName = this.player.name;
          this.playerIndex = switchIdx;
          turnLog.actions.push({ actor: 'player', message: `🔄 あなたは ${oldName} から ${this.player.name} に こうたい！` });
        }
      } else {
        if (switchIdx >= 0 && switchIdx < this.enemyTeam.length && this.enemyTeam[switchIdx].currentHp > 0 && switchIdx !== this.enemyIndex) {
          const oldName = this.enemy.name;
          this.enemyIndex = switchIdx;
          turnLog.actions.push({ actor: 'enemy', message: `🔄 相手は ${oldName} から ${this.enemy.name} に こうたい！` });
        }
      }
      return;
    }

    if (action === 'guard' || action === 'item') return;

    const self = (actor === 'player') ? this.player : this.enemy;
    const target = (actor === 'player') ? this.enemy : this.player;

    if (self.currentHp <= 0 || target.currentHp <= 0) return;

    if (Math.random() < 0.04) {
      turnLog.actions.push({ actor: (actor === 'player') ? 'player' : 'enemy', message: `${self.name} の こうげき！ しかし MISS!` });
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
        turnLog.actions.push({ actor: (actor === 'player') ? 'player' : 'enemy', message: `✨ ${self.name} の ひっさつ技【ギガブレイク】発動！` });
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
      actor: (actor === 'player') ? 'player' : 'enemy',
      message: `${self.name} の こうげき！ -> ${target.name} に ${dmg} ダメージ！`
    });
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

  _checkWin(turnLog) {
    if (this.enemy.currentHp <= 0) {
      if (this.mode === '3p') {
        const aliveSubs = this.getAliveSubIndexes(false);
        if (aliveSubs.length > 0) {
          this.enemyIndex = aliveSubs[0];
          turnLog.actions.push({ actor: 'system', message: `🎉 相手のキャラを たおした！ 敵チームは ${this.enemy.name} が 出撃！` });
          return false;
        }
      }
      this.isOver = true;
      this.winner = 'player';
      turnLog.actions.push({ actor: 'system', message: `🎉 ${this.enemy.name} を たおした！ あなたの しょうり！` });
      return true;
    }
    if (this.player.currentHp <= 0) {
      if (this.mode === '3p') {
        const aliveSubs = this.getAliveSubIndexes(true);
        if (aliveSubs.length > 0) {
          this.playerIndex = aliveSubs[0];
          turnLog.actions.push({ actor: 'system', message: `💧 あなたのキャラが たおれた... つぎの ${this.player.name} が 出撃！` });
          return false;
        }
      }
      this.isOver = true;
      this.winner = 'enemy';
      turnLog.actions.push({ actor: 'system', message: `💧 ${this.player.name} は たおれた... あなたの まけ...` });
      return true;
    }
    return false;
  }

  exportHostState() {
    return {
      turn: this.turn,
      isOver: this.isOver,
      winner: this.winner,
      playerIndex: this.playerIndex,
      enemyIndex: this.enemyIndex,
      playerTeam: this.playerTeam.map(c => ({ hp: c.hp, maxHp: c.maxHp, currentHp: c.currentHp, sp: c.sp, name: c.name, element: c.element, rarity: c.rarity, species: c.species, spriteSvg: c.spriteSvg })),
      enemyTeam: this.enemyTeam.map(c => ({ hp: c.hp, maxHp: c.maxHp, currentHp: c.currentHp, sp: c.sp, name: c.name, element: c.element, rarity: c.rarity, species: c.species, spriteSvg: c.spriteSvg })),
      playerItemUsed: [...this.playerItemUsed],
      enemyItemUsed: [...this.enemyItemUsed]
    };
  }

  applyGuestState(hostState) {
    this.turn = hostState.turn;
    this.isOver = hostState.isOver;
    this.winner = (hostState.winner === 'player') ? 'enemy' : (hostState.winner === 'enemy') ? 'player' : null;
    this.playerIndex = hostState.enemyIndex;
    this.enemyIndex = hostState.playerIndex;

    for (let i = 0; i < hostState.enemyTeam.length; i++) {
      if (this.playerTeam[i]) {
        this.playerTeam[i].currentHp = hostState.enemyTeam[i].currentHp;
        this.playerTeam[i].sp = hostState.enemyTeam[i].sp;
      }
    }
    for (let i = 0; i < hostState.playerTeam.length; i++) {
      if (this.enemyTeam[i]) {
        this.enemyTeam[i].currentHp = hostState.playerTeam[i].currentHp;
        this.enemyTeam[i].sp = hostState.playerTeam[i].sp;
      }
    }

    this.playerItemUsed = [...hostState.enemyItemUsed];
    this.enemyItemUsed = [...hostState.playerItemUsed];
  }
}
