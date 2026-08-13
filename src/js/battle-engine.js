/**
 * Battle Engine Module (Defensive Programming & NaN Prevention)
 */

export class BattleEngine {
  constructor(playerTeam, playerItem, enemyTeam, enemyItem, mode = '1p') {
    this.mode = mode; // '1p' | '3p'

    // 安全防衛: 入力データを検証・補正してNaNを防ぐ
    this.playerTeam = (Array.isArray(playerTeam) ? playerTeam : [playerTeam]).map(c => this._normalizeCharacter(c, true));
    this.enemyTeam = (Array.isArray(enemyTeam) ? enemyTeam : [enemyTeam]).map(c => this._normalizeCharacter(c, false));

    this.playerIndex = 0;
    this.enemyIndex = 0;

    this.playerItem = playerItem;
    this.enemyItem = enemyItem;

    this.turn = 1;
    this.maxTurns = 10;
    this.isOver = false;
    this.winner = null;
    this.logHistory = [];
  }

  /**
   * キャラクターオブジェクトの属性・数値を正規化し、NaN/undefinedの発生を完全に防ぐ
   */
  _normalizeCharacter(charObj, isPlayer) {
    const fallbackName = isPlayer ? "爆炎ドラゴン" : "アクアタイガー";
    const hpVal = Math.max(100, Number(charObj?.hp) || 1200);
    const atkVal = Math.max(10, Number(charObj?.atk) || 180);
    const defVal = Math.max(0, Number(charObj?.def) || 80);
    const spdVal = Math.max(5, Number(charObj?.spd) || 50);

    return {
      id: charObj?.id || `char_${Math.random()}`,
      barcode: charObj?.barcode || "4901234567890",
      type: "character",
      name: charObj?.name || fallbackName,
      element: charObj?.element || "火",
      rarity: charObj?.rarity || "R",
      hp: hpVal,
      maxHp: hpVal,
      currentHp: hpVal,
      atk: atkVal,
      def: defVal,
      spd: spdVal,
      skill: charObj?.skill || { name: "ギガブレイク", desc: "大ダメージをあたえる" },
      spriteSvg: charObj?.spriteSvg || `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="currentColor"/></svg>`,
      sp: 0,
      isGuarding: false,
      qteUsed: false,
      itemUsed: false,
      isPlayer: isPlayer
    };
  }

  get player() { return this.playerTeam[this.playerIndex]; }
  get enemy() { return this.enemyTeam[this.enemyIndex]; }

  static getElementMultiplier(attackerElement, defenderElement) {
    if (attackerElement === "火" && defenderElement === "木") return 1.5;
    if (attackerElement === "木" && defenderElement === "水") return 1.5;
    if (attackerElement === "水" && defenderElement === "火") return 1.5;
    return 1.0;
  }

  static calculateTurnPriority(spd) {
    const randomRatio = 0.85 + Math.random() * 0.30;
    return (Number(spd) || 50) * randomRatio;
  }

  processTurn(playerAction, playerQteSuccess = false, enemyAction = null, enemyQteSuccess = false) {
    if (this.isOver) return null;

    if (!enemyAction) {
      const options = ['attack', 'attack', 'guard'];
      if (this.enemy.sp >= 100) options.push('skill');
      enemyAction = options[Math.floor(Math.random() * options.length)];
    }

    const turnLog = {
      turn: this.turn,
      actions: []
    };

    this.player.isGuarding = (playerAction === 'guard');
    this.enemy.isGuarding = (enemyAction === 'guard');

    if (playerAction === 'item' && this.playerItem && !this.player.itemUsed) {
      this.player.itemUsed = true;
      this._useItem(this.player, this.playerItem, turnLog, true);
    }
    if (enemyAction === 'item' && this.enemyItem && !this.enemy.itemUsed) {
      this.enemy.itemUsed = true;
      this._useItem(this.enemy, this.enemyItem, turnLog, false);
    }

    if (this.player.isGuarding) {
      this.player.sp = Math.min(100, this.player.sp + 30);
      turnLog.actions.push({ actor: 'player', message: `🛡️ ${this.player.name} は ガード！ (被ダメ半減 & SP +30%)` });
    }
    if (this.enemy.isGuarding) {
      this.enemy.sp = Math.min(100, this.enemy.sp + 30);
      turnLog.actions.push({ actor: 'enemy', message: `🛡️ ${this.enemy.name} は ガード！ (被ダメ半減 & SP +30%)` });
    }

    const playerPriority = BattleEngine.calculateTurnPriority(this.player.spd);
    const enemyPriority = BattleEngine.calculateTurnPriority(this.enemy.spd);

    const firstActor = (playerPriority >= enemyPriority) ? 'player' : 'enemy';
    const secondActor = (firstActor === 'player') ? 'enemy' : 'player';

    const actionMap = {
      player: { action: playerAction, qte: playerQteSuccess, self: this.player, target: this.enemy },
      enemy: { action: enemyAction, qte: enemyQteSuccess, self: this.enemy, target: this.player }
    };

    this._executeAction(actionMap[firstActor], turnLog);

    if (!this._checkCheckmate(turnLog)) {
      this._executeAction(actionMap[secondActor], turnLog);
      this._checkCheckmate(turnLog);
    }

    if (!this.isOver) {
      this.turn++;
      if (this.turn > this.maxTurns) {
        const playerHpRatio = this.player.currentHp / this.player.maxHp;
        const enemyHpRatio = this.enemy.currentHp / this.enemy.maxHp;

        this.isOver = true;
        if (playerHpRatio > enemyHpRatio) {
          this.winner = 'player';
          turnLog.actions.push({ actor: 'system', message: "10ターン けいか！ 残りHP率が おおい あなたの しょうり！" });
        } else if (enemyHpRatio > playerHpRatio) {
          this.winner = 'enemy';
          turnLog.actions.push({ actor: 'system', message: "10ターン けいか！ 残りHP率が おおい あいての しょうり..." });
        } else {
          this.winner = 'draw';
          turnLog.actions.push({ actor: 'system', message: "10ターン けいか！ ひきわけ！" });
        }
      }
    }

    this.logHistory.push(turnLog);
    return turnLog;
  }

  _useItem(target, item, turnLog, isPlayer) {
    let msg = "";
    const val = Number(item.value) || 100;
    if (item.effectType === "heal") {
      const healAmt = Math.min(val, target.maxHp - target.currentHp);
      target.currentHp += healAmt;
      msg = `💊 【${item.name}】を つかった！ HPが ${healAmt} かいふく！`;
    } else if (item.effectType === "buff_atk") {
      target.atk += val;
      msg = `💊 【${item.name}】を つかった！ ATKが +${val} アップ！`;
    } else if (item.effectType === "buff_def") {
      target.def += val;
      msg = `💊 【${item.name}】を つかった！ DEFが +${val} アップ！`;
    } else if (item.effectType === "buff_spd") {
      target.spd += val;
      msg = `💊 【${item.name}】を つかった！ SPDが +${val} アップ！`;
    }

    turnLog.actions.push({ actor: isPlayer ? 'player' : 'enemy', message: `${target.name} は ${msg}` });
  }

  _executeAction({ action, qte, self, target }, turnLog) {
    if (self.currentHp <= 0 || target.currentHp <= 0) return;
    if (action === 'guard' || action === 'item') return;

    const isMiss = (Math.random() < 0.08);
    if (isMiss && action !== 'qte') {
      turnLog.actions.push({
        actor: self.isPlayer ? 'player' : 'enemy',
        message: `${self.name} の こうげき！ しかし MISS! (ダメージ 0)`
      });
      return;
    }

    const selfAtk = Number(self.atk) || 150;
    const targetDef = Number(target.def) || 50;

    let rawDamage = Math.max(1, selfAtk - targetDef);
    const elemMult = BattleEngine.getElementMultiplier(self.element, target.element);
    const randMult = 0.90 + Math.random() * 0.20;

    let finalDamage = 0;
    let actionDesc = "";

    if (action === 'attack') {
      finalDamage = Math.max(1, Math.round(rawDamage * elemMult * randMult));
      actionDesc = `${self.name} の こうげき！`;
      self.sp = Math.min(100, self.sp + 25);
    } else if (action === 'skill') {
      if (self.sp >= 100) {
        self.sp = 0;
        finalDamage = Math.max(1, Math.round(rawDamage * 1.8 * elemMult * randMult));
        actionDesc = `✨ ${self.name} の ひっさつ【${self.skill?.name || "ギガブレイク"}】！`;
      } else {
        finalDamage = Math.max(1, Math.round(rawDamage * elemMult * randMult));
        actionDesc = `${self.name} の こうげき！`;
      }
    } else if (action === 'qte') {
      self.qteUsed = true;
      if (qte) {
        finalDamage = Math.max(1, Math.round(rawDamage * 2.5 * elemMult * randMult));
        actionDesc = `💥 【ぎゃくてん】 タイミング成功！ 2.5倍大打撃！`;
      } else {
        finalDamage = Math.max(1, Math.round(rawDamage * 0.5 * randMult));
        actionDesc = `💥 【ぎゃくてん】 タイミング失敗... (小ダメージ)`;
      }
    }

    if (target.isGuarding) {
      finalDamage = Math.max(1, Math.round(finalDamage * 0.5));
      actionDesc += ` (ガード中・半減)`;
    }

    // ダメージ減算
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    target.sp = Math.min(100, target.sp + 15);

    turnLog.actions.push({
      actor: self.isPlayer ? 'player' : 'enemy',
      message: `${actionDesc} -> ${target.name} に ${finalDamage} ダメージ！`
    });
  }

  _checkCheckmate(turnLog) {
    if (this.enemy.currentHp <= 0) {
      if (this.mode === '3p' && this.enemyIndex < this.enemyTeam.length - 1) {
        this.enemyIndex++;
        turnLog.actions.push({ actor: 'system', message: `🎉 相手のキャラを たおした！ 敵チームは ${this.enemy.name} を くりだした！` });
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
