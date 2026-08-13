/**
 * UI Controller Module (Comprehensive Refactor)
 * 全画面（SCR-01〜SCR-07）、カード詳細ダイアログ、デッキ組み換え、1P/3Pモード選択、バトルアイテム、逃げる機能
 */

import { BarcodeEngine } from './barcode-engine.js';
import { StorageManager } from './storage.js';
import { BattleEngine } from './battle-engine.js';
import { NetworkManager } from './network.js';

export class UIController {
  constructor() {
    this.currentScreen = 'SCR-01';
    this.activeBattle = null;
    this.network = new NetworkManager();
    this.scannedTempCard = null;
    this.selectedCardForDetail = null;

    // 対戦設定
    this.matchMode = '1p'; // '1p' | '3p'

    // QTE制御
    this.qteAnimationId = null;
    this.qtePointerPos = 0;
    this.qteSpeed = 2.5;
    this.qteDirection = 1;

    // カメラ関連
    this.mediaStream = null;
    this.scanIntervalId = null;
    this.barcodeDetector = null;

    if ('BarcodeDetector' in window) {
      try {
        this.barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'qr_code'] });
      } catch (e) {
        console.log("BarcodeDetector ready", e);
      }
    }
  }

  init() {
    this.bindNavigationEvents();
    this.bindScanEvents();
    this.bindDeckEvents();
    this.bindLobbyEvents();
    this.bindBattleEvents();
    this.renderHome();
  }

  switchScreen(screenId) {
    if (this.currentScreen === 'SCR-02' && screenId !== 'SCR-02') {
      this.stopCamera();
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
    }

    if (screenId === 'SCR-01') this.renderHome();
    else if (screenId === 'SCR-02') this.startCamera();
    else if (screenId === 'SCR-04') this.renderDeckAndCollection();
    else if (screenId === 'SCR-05') this.renderLobby();
  }

  bindNavigationEvents() {
    document.getElementById('btn-nav-scan')?.addEventListener('click', () => this.switchScreen('SCR-02'));
    document.getElementById('btn-nav-deck')?.addEventListener('click', () => this.switchScreen('SCR-04'));
    document.getElementById('btn-nav-battle')?.addEventListener('click', () => this.switchScreen('SCR-05'));
    
    document.querySelectorAll('.btn-back-home').forEach(btn => {
      btn.addEventListener('click', () => this.switchScreen('SCR-01'));
    });
  }

  // --- SCR-01: ホーム ---
  renderHome() {
    const collection = StorageManager.getCollection();
    const countBadge = document.getElementById('home-count-badge');
    if (countBadge) countBadge.textContent = `しょじ ${collection.length}/100`;

    const showcase = document.getElementById('home-showcase');
    const deck = StorageManager.getDeck();
    const mainChar = deck.mainChar || collection.find(c => c.type === 'character');

    if (mainChar && showcase) {
      showcase.innerHTML = `
        <div class="sprite-container" style="color: var(--element-${mainChar.element})">
          ${mainChar.spriteSvg}
        </div>
        <div class="char-name">${mainChar.name}</div>
        <div style="margin-bottom: 6px;">
          <span class="element-tag element-${mainChar.element}">${mainChar.element}</span>
          <span class="rarity-tag">${mainChar.rarity}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
          HP: ${mainChar.hp} / ATK: ${mainChar.atk} / DEF: ${mainChar.def} / SPD: ${mainChar.spd}
        </div>
      `;
    } else if (showcase) {
      showcase.innerHTML = `<div style="color: var(--text-muted); padding: 20px 0;">バーコードを スキャンして<br>キャラを ゲットしよう！</div>`;
    }
  }

  // --- SCR-02: スキャン ---
  async startCamera() {
    const video = document.getElementById('scan-video');
    const statusMsg = document.getElementById('camera-status-msg');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMsg) statusMsg.textContent = "※ お使いのブラウザは カメラに 対応していません（下のボタンをお使いください）";
      return;
    }

    try {
      if (statusMsg) statusMsg.textContent = "カメラを き動しています...";
      
      const constraints = {
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (video) {
        video.srcObject = this.mediaStream;
        await video.play();
      }

      if (statusMsg) statusMsg.textContent = "バーコードを わくの中に あわせよう！";
      this.startScanLoop();

    } catch (err) {
      console.error("Camera access error:", err);
      if (statusMsg) statusMsg.textContent = "⚠️ カメラのきょかが ありません。下のテストボタンをご利用ください。";
    }
  }

  stopCamera() {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    const video = document.getElementById('scan-video');
    if (video) video.srcObject = null;
  }

  startScanLoop() {
    const video = document.getElementById('scan-video');
    if (!video) return;

    this.scanIntervalId = setInterval(async () => {
      if (!video.videoWidth || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      if (this.barcodeDetector) {
        try {
          const barcodes = await this.barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const detectedCode = barcodes[0].rawValue;
            this.stopCamera();
            this.processScanResult(detectedCode);
          }
        } catch (e) {}
      }
    }, 300);
  }

  bindScanEvents() {
    document.getElementById('btn-start-camera')?.addEventListener('click', () => this.startCamera());
    document.getElementById('btn-stop-camera-back')?.addEventListener('click', () => {
      this.stopCamera();
      this.switchScreen('SCR-01');
    });

    document.querySelectorAll('.btn-demo-barcode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.target.getAttribute('data-code');
        this.stopCamera();
        this.processScanResult(code);
      });
    });

    document.getElementById('btn-manual-scan')?.addEventListener('click', () => {
      const input = document.getElementById('input-manual-barcode');
      if (input && input.value) {
        this.stopCamera();
        this.processScanResult(input.value);
      }
    });

    document.getElementById('btn-save-scanned')?.addEventListener('click', () => {
      if (this.scannedTempCard) {
        const memoInput = document.getElementById('scanned-memo-input');
        if (memoInput) this.scannedTempCard.memo = memoInput.value;
        
        StorageManager.saveToCollection(this.scannedTempCard);
        this.switchScreen('SCR-04');
      }
    });
  }

  processScanResult(barcodeStr) {
    this.scannedTempCard = BarcodeEngine.generateFromBarcode(barcodeStr);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const resultBox = document.getElementById('scan-result-card');
    if (resultBox) {
      if (this.scannedTempCard.type === 'character') {
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; color: var(--accent-gold); font-weight: 900; margin-bottom: 6px;">
            ✨ ${this.scannedTempCard.rarity} ゲット！
          </div>
          <div class="sprite-container" style="color: var(--element-${this.scannedTempCard.element})">
            ${this.scannedTempCard.spriteSvg}
          </div>
          <div class="char-name">${this.scannedTempCard.name}</div>
          <div style="margin-bottom: 6px;">
            <span class="element-tag element-${this.scannedTempCard.element}">${this.scannedTempCard.element}</span>
          </div>
          <div style="font-size: 0.85rem; line-height: 1.4; color: var(--text-muted);">
            HP: ${this.scannedTempCard.hp} / ATK: ${this.scannedTempCard.atk}<br>
            DEF: ${this.scannedTempCard.def} / SPD: ${this.scannedTempCard.spd}<br>
            ✨ 固有技: 【${this.scannedTempCard.skill.name}】
          </div>
        `;
      } else {
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; color: var(--accent-gold); font-weight: 900; margin-bottom: 6px;">
            🎁 きょうかアイテム ゲット！
          </div>
          <div class="char-name" style="color: var(--accent-gold);">${this.scannedTempCard.name}</div>
          <div style="font-size: 0.9rem; margin-top: 6px; color: var(--text-muted);">${this.scannedTempCard.desc}</div>
        `;
      }
    }

    const memoInput = document.getElementById('scanned-memo-input');
    if (memoInput) memoInput.value = "";

    this.switchScreen('SCR-03');
  }

  // --- SCR-04: 図鑑・デッキ編成・詳細モーダル ---
  bindDeckEvents() {
    // タブ切替
    const tabCol = document.getElementById('tab-btn-collection');
    const tabDeck = document.getElementById('tab-btn-deck');
    const viewCol = document.getElementById('view-collection-tab');
    const viewDeck = document.getElementById('view-deck-tab');

    tabCol?.addEventListener('click', () => {
      tabCol.classList.add('active');
      tabDeck?.classList.remove('active');
      if (viewCol) viewCol.style.display = 'flex';
      if (viewDeck) viewDeck.style.display = 'none';
      this.renderCollectionGrid();
    });

    tabDeck?.addEventListener('click', () => {
      tabDeck.classList.add('active');
      tabCol?.classList.remove('active');
      if (viewDeck) viewDeck.style.display = 'flex';
      if (viewCol) viewCol.style.display = 'none';
      this.renderDeckSlots();
    });

    // モーダル閉じる
    document.getElementById('btn-close-detail')?.addEventListener('click', () => {
      document.getElementById('detail-modal')?.classList.remove('active');
    });

    // スロットセットボタン
    document.getElementById('btn-set-main')?.addEventListener('click', () => this.assignSelectedToSlot('mainChar'));
    document.getElementById('btn-set-sub1')?.addEventListener('click', () => this.assignSelectedToSlot('subChar1'));
    document.getElementById('btn-set-sub2')?.addEventListener('click', () => this.assignSelectedToSlot('subChar2'));
    document.getElementById('btn-set-item')?.addEventListener('click', () => this.assignSelectedToSlot('itemCard'));
  }

  renderDeckAndCollection() {
    this.renderCollectionGrid();
    this.renderDeckSlots();
  }

  renderCollectionGrid() {
    const grid = document.getElementById('collection-grid-container');
    if (!grid) return;

    const collection = StorageManager.getCollection();
    grid.innerHTML = "";

    if (collection.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/3; text-align: center; color: var(--text-muted); padding: 40px 0;">まだ カードが ありません。<br>スキャンしてみよう！</div>`;
      return;
    }

    collection.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `card-item ${card.type === 'item' ? 'item-card' : ''}`;
      
      if (card.type === 'character') {
        cardEl.innerHTML = `
          <div class="mini-sprite" style="color: var(--element-${card.element});">${card.spriteSvg}</div>
          <div style="font-weight: 800; font-size: 0.8rem; margin: 4px 0;">${card.name}</div>
          <span class="element-tag element-${card.element}" style="font-size: 0.68rem;">${card.element} / ${card.rarity}</span>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">HP:${card.hp} ATK:${card.atk}</div>
        `;
      } else {
        cardEl.innerHTML = `
          <div style="font-size: 1.6rem;">🎁</div>
          <div style="font-weight: 800; font-size: 0.8rem; color: var(--accent-gold);">${card.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${card.desc}</div>
        `;
      }

      cardEl.addEventListener('click', () => {
        this.openCardDetailModal(card);
      });

      grid.appendChild(cardEl);
    });
  }

  openCardDetailModal(card) {
    this.selectedCardForDetail = card;
    const content = document.getElementById('detail-card-content');
    const modal = document.getElementById('detail-modal');

    const btnMain = document.getElementById('btn-set-main');
    const btnSub1 = document.getElementById('btn-set-sub1');
    const btnSub2 = document.getElementById('btn-set-sub2');
    const btnItem = document.getElementById('btn-set-item');

    if (card.type === 'character') {
      if (btnMain) btnMain.style.display = 'block';
      if (btnSub1) btnSub1.style.display = 'block';
      if (btnSub2) btnSub2.style.display = 'block';
      if (btnItem) btnItem.style.display = 'none';

      content.innerHTML = `
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 6px;">
          【キャラ能力詳細】
        </div>
        <div class="sprite-container" style="color: var(--element-${card.element}); margin: 0 auto 8px auto; width: 80px; height: 80px;">
          ${card.spriteSvg}
        </div>
        <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">${card.name}</div>
        <div style="margin-bottom: 8px;">
          <span class="element-tag element-${card.element}">${card.element}</span>
          <span class="rarity-tag">${card.rarity}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: left; background: var(--surface-card); padding: 8px; border-radius: 8px; line-height: 1.5;">
          ❤️ 体力 (HP): ${card.hp}<br>
          ⚔️ 攻撃力 (ATK): ${card.atk}<br>
          🛡️ 防御力 (DEF): ${card.def}<br>
          ⚡ 素早さ (SPD): ${card.spd}<br>
          ✨ 必殺技: 【${card.skill.name}】 (${card.skill.desc})<br>
          📝 メモ: ${card.memo || "メモなし"}
        </div>
      `;
    } else {
      if (btnMain) btnMain.style.display = 'none';
      if (btnSub1) btnSub1.style.display = 'none';
      if (btnSub2) btnSub2.style.display = 'none';
      if (btnItem) btnItem.style.display = 'block';

      content.innerHTML = `
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 6px;">
          【アイテム効果詳細】
        </div>
        <div style="font-size: 2.5rem; margin: 8px 0;">🎁</div>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold);">${card.name}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: left; background: var(--surface-card); padding: 10px; border-radius: 8px; margin-top: 10px; line-height: 1.5;">
          💊 効果: ${card.desc}<br>
          📝 メモ: ${card.memo || "メモなし"}
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  }

  assignSelectedToSlot(slotType) {
    if (!this.selectedCardForDetail) return;
    StorageManager.setDeckSlot(slotType, this.selectedCardForDetail);
    
    document.getElementById('detail-modal')?.classList.remove('active');
    alert(`【${this.selectedCardForDetail.name}】を セットしました！`);
    this.renderDeckSlots();
    this.renderHome();
  }

  renderDeckSlots() {
    const deck = StorageManager.getDeck();

    const m = document.getElementById('slot-content-main');
    const s1 = document.getElementById('slot-content-sub1');
    const s2 = document.getElementById('slot-content-sub2');
    const item = document.getElementById('slot-content-item');

    if (m) m.textContent = deck.mainChar ? `${deck.mainChar.name} (HP:${deck.mainChar.hp} ATK:${deck.mainChar.atk})` : "未セット";
    if (s1) s1.textContent = deck.subChar1 ? `${deck.subChar1.name} (HP:${deck.subChar1.hp} ATK:${deck.subChar1.atk})` : "未セット";
    if (s2) s2.textContent = deck.subChar2 ? `${deck.subChar2.name} (HP:${deck.subChar2.hp} ATK:${deck.subChar2.atk})` : "未セット";
    if (item) item.textContent = deck.itemCard ? `${deck.itemCard.name} (${deck.itemCard.desc})` : "未セット";
  }

  // --- SCR-05: 対戦ロビー ---
  bindLobbyEvents() {
    // 1P / 3P モード選択
    const btn1p = document.getElementById('btn-mode-1p');
    const btn3p = document.getElementById('btn-mode-3p');

    btn1p?.addEventListener('click', () => {
      this.matchMode = '1p';
      btn1p.classList.add('active');
      btn3p?.classList.remove('active');
    });

    btn3p?.addEventListener('click', () => {
      this.matchMode = '3p';
      btn3p.classList.add('active');
      btn1p?.classList.remove('active');
    });

    document.getElementById('btn-create-room')?.addEventListener('click', () => {
      const roomCode = NetworkManager.generateRoomCode();
      this.network.createRoom(roomCode);
      
      const codeDisplay = document.getElementById('host-room-code');
      if (codeDisplay) codeDisplay.textContent = roomCode;

      document.getElementById('lobby-select-view').style.display = 'none';
      document.getElementById('lobby-host-wait-view').style.display = 'block';

      this.network.onMessageCallback = (data) => {
        if (data.type === 'JOIN_REQUEST') {
          this.startBattle(true);
        }
      };
    });

    document.getElementById('btn-cancel-host')?.addEventListener('click', () => {
      this.network.disconnect();
      document.getElementById('lobby-select-view').style.display = 'block';
      document.getElementById('lobby-host-wait-view').style.display = 'none';
    });

    document.getElementById('btn-join-room')?.addEventListener('click', () => {
      const input = document.getElementById('input-guest-code');
      if (input && input.value.length === 4) {
        this.network.joinRoom(input.value);
        this.startBattle(false);
      } else {
        alert("4けたの ルームコードを 正しく入力してください (例: 7821)");
      }
    });

    document.getElementById('btn-cpu-battle')?.addEventListener('click', () => {
      this.startCpuBattle();
    });
  }

  renderLobby() {
    document.getElementById('lobby-select-view').style.display = 'block';
    document.getElementById('lobby-host-wait-view').style.display = 'none';
  }

  // --- SCR-06: バトル & アイテム & 逃げる ---
  startCpuBattle() {
    const deck = StorageManager.getDeck();
    
    // プレイヤーチーム構成
    let playerTeam = [deck.mainChar || BarcodeEngine.generateFromBarcode("4901234567890")];
    if (this.matchMode === '3p') {
      playerTeam.push(deck.subChar1 || BarcodeEngine.generateFromBarcode("4901111111111"));
      playerTeam.push(deck.subChar2 || BarcodeEngine.generateFromBarcode("4902222222222"));
    }

    // CPU敵チーム構成
    let enemyTeam = [BarcodeEngine.generateFromBarcode("4909876543210")];
    if (this.matchMode === '3p') {
      enemyTeam.push(BarcodeEngine.generateFromBarcode("4903333333333"));
      enemyTeam.push(BarcodeEngine.generateFromBarcode("4904444444444"));
    }

    this.activeBattle = new BattleEngine(playerTeam, deck.itemCard, enemyTeam, null, this.matchMode);
    
    const logBox = document.getElementById('battle-log');
    if (logBox) logBox.innerHTML = `<div>⚔️ CPUとの ${this.matchMode === '3p' ? '3Pチーム戦' : '1Pタイマン戦'} が はじまった！</div>`;

    this.renderBattleScreen();
    this.switchScreen('SCR-06');
  }

  startBattle(isHost) {
    const deck = StorageManager.getDeck();

    let playerTeam = [deck.mainChar || BarcodeEngine.generateFromBarcode("4901234567890")];
    if (this.matchMode === '3p') {
      playerTeam.push(deck.subChar1 || BarcodeEngine.generateFromBarcode("4901111111111"));
      playerTeam.push(deck.subChar2 || BarcodeEngine.generateFromBarcode("4902222222222"));
    }

    let enemyTeam = [BarcodeEngine.generateFromBarcode(isHost ? "4908888888888" : "4901111222233")];
    if (this.matchMode === '3p') {
      enemyTeam.push(BarcodeEngine.generateFromBarcode("4905555555555"));
      enemyTeam.push(BarcodeEngine.generateFromBarcode("4906666666666"));
    }

    this.activeBattle = new BattleEngine(playerTeam, deck.itemCard, enemyTeam, null, this.matchMode);

    const logBox = document.getElementById('battle-log');
    if (logBox) logBox.innerHTML = `<div>⚔️ プレイヤー対戦が はじまった！</div>`;

    this.renderBattleScreen();
    this.switchScreen('SCR-06');
  }

  bindBattleEvents() {
    document.getElementById('btn-cmd-attack')?.addEventListener('click', () => this.handlePlayerAction('attack'));
    document.getElementById('btn-cmd-skill')?.addEventListener('click', () => this.handlePlayerAction('skill'));
    document.getElementById('btn-cmd-guard')?.addEventListener('click', () => this.handlePlayerAction('guard'));
    document.getElementById('btn-cmd-item')?.addEventListener('click', () => this.handlePlayerAction('item'));
    document.getElementById('btn-cmd-qte')?.addEventListener('click', () => this.triggerQteModal());

    document.getElementById('btn-qte-stop')?.addEventListener('click', () => this.resolveQte());

    // 🏃 にげる ボタン
    document.getElementById('btn-battle-escape')?.addEventListener('click', () => {
      if (confirm("ほんとうに 対戦から にげますか？（まけ扱いになります）")) {
        this.switchScreen('SCR-05');
      }
    });

    // リザルトからロビーへ
    document.getElementById('btn-result-lobby')?.addEventListener('click', () => {
      this.switchScreen('SCR-05');
    });
  }

  renderBattleScreen() {
    if (!this.activeBattle) return;
    const b = this.activeBattle;

    // 自分
    document.getElementById('p-name').textContent = b.player.name;
    document.getElementById('p-hp-num').textContent = `${b.player.currentHp}/${b.player.maxHp}`;
    document.getElementById('p-hp-bar').style.width = `${Math.max(0, (b.player.currentHp / b.player.maxHp) * 100)}%`;
    document.getElementById('p-sp-bar').style.width = `${b.player.sp}%`;
    document.getElementById('p-sprite').innerHTML = b.player.spriteSvg;
    document.getElementById('p-sprite').style.color = `var(--element-${b.player.element})`;

    // 敵
    document.getElementById('e-name').textContent = b.enemy.name;
    document.getElementById('e-hp-num').textContent = `${b.enemy.currentHp}/${b.enemy.maxHp}`;
    document.getElementById('e-hp-bar').style.width = `${Math.max(0, (b.enemy.currentHp / b.enemy.maxHp) * 100)}%`;
    document.getElementById('e-sp-bar').style.width = `${b.enemy.sp}%`;
    document.getElementById('e-sprite').innerHTML = b.enemy.spriteSvg;
    document.getElementById('e-sprite').style.color = `var(--element-${b.enemy.element})`;

    // コマンドボタン状態
    const btnSkill = document.getElementById('btn-cmd-skill');
    if (btnSkill) btnSkill.disabled = (b.player.sp < 100);

    const btnItem = document.getElementById('btn-cmd-item');
    if (btnItem) btnItem.disabled = (!b.playerItem || b.player.itemUsed);

    const btnQte = document.getElementById('btn-cmd-qte');
    if (btnQte) btnQte.disabled = b.player.qteUsed;
  }

  handlePlayerAction(action, qteResult = false) {
    if (!this.activeBattle || this.activeBattle.isOver) return;

    const turnLog = this.activeBattle.processTurn(action, qteResult, null, false);
    
    this.renderBattleScreen();
    this.appendBattleLog(turnLog);

    if (this.activeBattle.isOver) {
      setTimeout(() => this.showResult(this.activeBattle.winner), 1200);
    }
  }

  appendBattleLog(turnLog) {
    const logBox = document.getElementById('battle-log');
    if (!logBox || !turnLog) return;

    turnLog.actions.forEach(act => {
      const div = document.createElement('div');
      div.style.marginBottom = "4px";
      div.textContent = act.message;
      logBox.appendChild(div);
    });
    logBox.scrollTop = logBox.scrollHeight;
  }

  triggerQteModal() {
    const modal = document.getElementById('qte-modal');
    if (modal) modal.classList.add('active');

    this.qtePointerPos = 0;
    this.qteDirection = 1;
    const pointer = document.getElementById('qte-pointer');

    const animLoop = () => {
      this.qtePointerPos += this.qteSpeed * this.qteDirection;
      if (this.qtePointerPos >= 95 || this.qtePointerPos <= 0) {
        this.qteDirection *= -1;
      }
      if (pointer) pointer.style.left = `${this.qtePointerPos}%`;
      this.qteAnimationId = requestAnimationFrame(animLoop);
    };

    this.qteAnimationId = requestAnimationFrame(animLoop);
  }

  resolveQte() {
    cancelAnimationFrame(this.qteAnimationId);
    const modal = document.getElementById('qte-modal');
    if (modal) modal.classList.remove('active');

    const isSuccess = (this.qtePointerPos >= 40 && this.qtePointerPos <= 60);
    this.handlePlayerAction('qte', isSuccess);
  }

  // --- SCR-07: リザルト ---
  showResult(winner) {
    const title = document.getElementById('result-title');
    const detailText = document.getElementById('result-detail-text');

    if (title) {
      if (winner === 'player') {
        title.textContent = "🎉 あなたの しょうり！";
        title.style.color = "var(--accent-gold)";
        if (detailText) detailText.textContent = "みごとな せんりゃくで あいてチームを ぜんめつさせた！";
      } else if (winner === 'enemy') {
        title.textContent = "💧 あなたの まけ...";
        title.style.color = "var(--primary-pink)";
        if (detailText) detailText.textContent = "あいての こうげきに やぶれてしまった... つぎは がんばろう！";
      } else {
        title.textContent = "🤝 ひきわけ！";
        title.style.color = "var(--secondary-cyan)";
        if (detailText) detailText.textContent = "10ターンが けいかした！ 互角の しょうぶだった！";
      }
    }
    this.switchScreen('SCR-07');
  }
}
