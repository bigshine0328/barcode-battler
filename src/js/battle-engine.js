/**
 * Battle Engine Module
 * ターン制コマンドバトル、ダメージ乱数、MISS判定、SPゲージ、QTE計算を担当
 */

export class BattleEngine {
  constructor(playerChar, playerItem, enemyChar, enemyItem) {
    this.player = {
      ...playerChar,
      currentHp: playerChar.hp,
      sp: 0,
      isGuarding: false,
      qteUsed: false,
      isPlayer: true
    };
    this.enemy = {
      ...enemyChar,
      currentHp: enemyChar.hp,
      sp: 0,
      isGuarding: false,
      qteUsed: false,
      isPlayer: false
    };

    // アイテム効果の適用（事前ブースト）
    if (playerItem) this._applyItemEffect(this.player, playerItem);
    if (enemyItem) this._applyItemEffect(this.enemy, enemyItem);

    this.turn = 1;
    this.maxTurns = 10;
    this.isOver = false;
    this.winner = null; // 'player' | 'enemy' | 'draw'
    this.logHistory = [];
  }

  _applyItemEffect(target, item) {
    if (item.effectType === "buff_atk") target.atk += item.value;
    else if (item.effectType === "buff_def") target.def += item.value;
    else if (item.effectType === "buff_spd") target.spd += item.value;
    else if (item.effectType === "heal") {
      target.hp += item.value;
      target.currentHp += item.value;
      target.maxHp += item.value;
    }
  }

  /**
   * 属性相性計算 (火 > 木 > 水 > 火)
   */
  static getElementMultiplier(attackerElement, defenderElement) {
    if (attackerElement === "火" && defenderElement === "木") return 1.5;
    if (attackerElement === "木" && defenderElement === "水") return 1.5;
    if (attackerElement === "水" && defenderElement === "火") return 1.5;
    return 1.0;
  }

  /**
   * 行動順判定値を算出 (SPD * 乱数 0.85 ~ 1.15)
   */
  static calculateTurnPriority(spd) {
    const randomRatio = 0.85 + Math.random() * 0.30; // 0.85 ~ 1.15
    return spd * randomRatio;
  }

  /**
   * 1ターン分のコマンド処理を実行
   * @param {string} playerAction - 'attack' | 'skill' | 'guard' | 'qte'
   * @param {boolean} playerQteSuccess - QTE結果 (true/false)
   * @param {string} enemyAction - CPUまたは敵対戦相手のコマンド
   */
  processTurn(playerAction, playerQteSuccess = false, enemyAction = 'attack', enemyQteSuccess = false) {
    if (this.isOver) return null;

    const turnLog = {
      turn: this.turn,
      actions: []
    };

    // 1. ガードフラグのリセット
    this.player.isGuarding = (playerAction === 'guard');
    this.enemy.isGuarding = (enemyAction === 'guard');

    if (this.player.isGuarding) {
      this.player.sp = Math.min(100, this.player.sp + 30);
      turnLog.actions.push({ actor: 'player', message: `${this.player.name} は ガードの しせいを とった！ (SP +30%)` });
    }
    if (this.enemy.isGuarding) {
      this.enemy.sp = Math.min(100, this.enemy.sp + 30);
      turnLog.actions.push({ actor: 'enemy', message: `${this.enemy.name} は ガードの しせいを とった！ (SP +30%)` });
    }

    // 2. 行動順判定
    const playerPriority = BattleEngine.calculateTurnPriority(this.player.spd);
    const enemyPriority = BattleEngine.calculateTurnPriority(this.enemy.spd);

    const firstActor = (playerPriority >= enemyPriority) ? 'player' : 'enemy';
    const secondActor = (firstActor === 'player') ? 'enemy' : 'player';

    const actionMap = {
      player: { action: playerAction, qte: playerQteSuccess, self: this.player, target: this.enemy },
      enemy: { action: enemyAction, qte: enemyQteSuccess, self: this.enemy, target: this.player }
    };

    // 先攻行動
    this._executeAction(actionMap[firstActor], turnLog);

    // 勝敗チェック
    if (!this._checkCheckmate(turnLog)) {
      // 後攻行動
      this._executeAction(actionMap[secondActor], turnLog);
      this._checkCheckmate(turnLog);
    }

    // 3. ターン経過判定
    if (!this.isOver) {
      this.turn++;
      if (this.turn > this.maxTurns) {
        // 10ターン制限到達 -> 残りHP割合判定
        const playerHpRatio = this.player.currentHp / this.player.maxHp;
        const enemyHpRatio = this.enemy.currentHp / this.enemy.maxHp;

        this.isOver = true;
        if (playerHpRatio > enemyHpRatio) {
          this.winner = 'player';
          turnLog.actions.push({ actor: 'system', message: "10ターン けいか！ 残りHPが おおい あなたの しょうり！" });
        } else if (enemyHpRatio > playerHpRatio) {
          this.winner = 'enemy';
          turnLog.actions.push({ actor: 'system', message: "10ターン けいか！ 残りHPが おおい あいての しょうり..." });
        } else {
          this.winner = 'draw';
          turnLog.actions.push({ actor: 'system', message: "10ターン けいか！ ひきわけ！" });
        }
      }
    }

    this.logHistory.push(turnLog);
    return turnLog;
  }

  _executeAction({ action, qte, self, target }, turnLog) {
    if (self.currentHp <= 0 || target.currentHp <= 0) return;
    if (action === 'guard') return; // ガードは事前処理済み

    // 命中判定 (8%の確率で MISS)
    const isMiss = (Math.random() < 0.08);
    if (isMiss && action !== 'qte') {
      turnLog.actions.push({
        actor: self.isPlayer ? 'player' : 'enemy',
        message: `${self.name} の こうげき！ しかし こうげきは MISS! (こうげき しっぱい)`
      });
      return;
    }

    let rawDamage = Math.max(1, self.atk - target.def);
    const elemMult = BattleEngine.getElementMultiplier(self.element, target.element);
    const randMult = 0.90 + Math.random() * 0.20; // 0.90 ~ 1.10

    let finalDamage = 0;
    let actionDesc = "";

    if (action === 'attack') {
      finalDamage = Math.round(rawDamage * elemMult * randMult);
      actionDesc = `${self.name} の こうげき！`;
      self.sp = Math.min(100, self.sp + 25); // 攻撃でSP+25%
    } else if (action === 'skill') {
      if (self.sp >= 100) {
        self.sp = 0;
        finalDamage = Math.round(rawDamage * 1.8 * elemMult * randMult);
        actionDesc = `✨ ${self.name} の ひっさつわざ【${self.skill.name}】！`;
      } else {
        // SP不足の場合通常攻撃
        finalDamage = Math.round(rawDamage * elemMult * randMult);
        actionDesc = `${self.name} の こうげき！`;
      }
    } else if (action === 'qte') {
      self.qteUsed = true;
      if (qte) {
        finalDamage = Math.round(rawDamage * 2.5 * elemMult * randMult);
        actionDesc = `💥 【一発逆転チャンス】 タイミングせいこう！ 超大ダメージ！`;
      } else {
        finalDamage = Math.round(rawDamage * 0.5 * randMult);
        actionDesc = `💥 【一発逆転チャンス】 タイミングしっぱい...（小ダメージ）`;
      }
    }

    // ガード減衰 (50%カット)
    if (target.isGuarding) {
      finalDamage = Math.max(1, Math.round(finalDamage * 0.5));
      actionDesc += ` (あいては ガードしている！ 被ダメージ半減)`;
    }

    // ダメージ適用
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    
    // 被ダメ側SP加算 (+15%)
    target.sp = Math.min(100, target.sp + 15);

    turnLog.actions.push({
      actor: self.isPlayer ? 'player' : 'enemy',
      message: `${actionDesc} -> ${target.name} に ${finalDamage} の ダメージ！`
    });
  }

  _checkCheckmate(turnLog) {
    if (this.enemy.currentHp <= 0) {
      this.isOver = true;
      this.winner = 'player';
      turnLog.actions.push({ actor: 'system', message: `🎉 ${this.enemy.name} を たおした！ あなたの しょうり！` });
      return true;
    }
    if (this.player.currentHp <= 0) {
      this.isOver = true;
      this.winner = 'enemy';
      turnLog.actions.push({ actor: 'system', message: `💧 ${this.player.name} は たおれた... あなたの まけ...` });
      return true;
    }
    return false;
  }
}
