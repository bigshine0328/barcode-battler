/**
 * UI Controller Module
 * 全画面（SCR-01〜SCR-07）のレンダリング、画面遷移、QTEモーダル制御、入力イベント
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
    this.qteAnimationId = null;
    this.qtePointerPos = 0;
    this.qteSpeed = 2.5;
    this.qteDirection = 1;

    // カメラ関連プロパティ
    this.mediaStream = null;
    this.scanIntervalId = null;
    this.barcodeDetector = null;

    if ('BarcodeDetector' in window) {
      try {
        this.barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'qr_code'] });
      } catch (e) {
        console.log("BarcodeDetector initialized with default settings", e);
      }
    }
  }

  init() {
    this.bindNavigationEvents();
    this.bindScanEvents();
    this.bindLobbyEvents();
    this.bindBattleEvents();
    this.renderHome();
  }

  switchScreen(screenId) {
    // 画面遷移時にカメラを安全に停止
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
    else if (screenId === 'SCR-04') this.renderCollection();
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
        <div>
          <span class="element-tag element-${mainChar.element}">${mainChar.element}</span>
          <span class="rarity-tag">${mainChar.rarity}</span>
        </div>
      `;
    }
  }

  // --- SCR-02: カメラ起動 & スキャン処理 ---
  async startCamera() {
    const video = document.getElementById('scan-video');
    const statusMsg = document.getElementById('camera-status-msg');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMsg) statusMsg.textContent = "※ お使いのブラウザは カメラに 対応していません（下のボタンをお使いください）";
      return;
    }

    try {
      if (statusMsg) statusMsg.textContent = "カメラを き動しています...";
      
      // リアカメラ優先
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

      // スキャンループの開始
      this.startScanLoop();

    } catch (err) {
      console.error("Camera access error:", err);
      if (statusMsg) {
        statusMsg.textContent = "⚠️ カメラのきょかが ありません。きょかするか 下のボタンをお使いください。";
      }
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
        } catch (e) {
          // Detector error fallback
        }
      }
    }, 300);
  }

  bindScanEvents() {
    // 手動カメラ起動ボタン
    document.getElementById('btn-start-camera')?.addEventListener('click', () => this.startCamera());
    document.getElementById('btn-stop-camera-back')?.addEventListener('click', () => {
      this.stopCamera();
      this.switchScreen('SCR-01');
    });

    // デモバーコードボタン
    document.querySelectorAll('.btn-demo-barcode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.target.getAttribute('data-code');
        this.stopCamera();
        this.processScanResult(code);
      });
    });

    // 手動バーコード入力
    document.getElementById('btn-manual-scan')?.addEventListener('click', () => {
      const input = document.getElementById('input-manual-barcode');
      if (input && input.value) {
        this.stopCamera();
        this.processScanResult(input.value);
      }
    });

    // 結果画面保存
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
    
    // バイブレーション演出
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const resultBox = document.getElementById('scan-result-card');
    if (resultBox) {
      if (this.scannedTempCard.type === 'character') {
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; color: var(--accent-gold); font-weight: 900; margin-bottom: 8px;">
            ✨ ${this.scannedTempCard.rarity} ゲット！
          </div>
          <div class="sprite-container" style="color: var(--element-${this.scannedTempCard.element})">
            ${this.scannedTempCard.spriteSvg}
          </div>
          <div class="char-name">${this.scannedTempCard.name}</div>
          <div style="margin-bottom: 8px;">
            <span class="element-tag element-${this.scannedTempCard.element}">${this.scannedTempCard.element}</span>
          </div>
          <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-muted);">
            HP: ${this.scannedTempCard.hp} / ATK: ${this.scannedTempCard.atk} / DEF: ${this.scannedTempCard.def} / SPD: ${this.scannedTempCard.spd}
          </div>
        `;
      } else {
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; color: var(--accent-gold); font-weight: 900; margin-bottom: 8px;">
            🎁 きょうかアイテム ゲット！
          </div>
          <div class="char-name" style="color: var(--accent-gold)">${this.scannedTempCard.name}</div>
          <div style="font-size: 0.95rem; margin-top: 8px;">${this.scannedTempCard.desc}</div>
        `;
      }
    }

    const memoInput = document.getElementById('scanned-memo-input');
    if (memoInput) memoInput.value = "";

    this.switchScreen('SCR-03');
  }

  // --- SCR-04: 図鑑 & 所持一覧 ---
  renderCollection() {
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
          <div class="mini-sprite" style="color: var(--element-${card.element})">${card.spriteSvg}</div>
          <div style="font-weight: 800; font-size: 0.85rem; margin: 4px 0;">${card.name}</div>
          <span class="element-tag element-${card.element}" style="font-size: 0.7rem;">${card.element}</span>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">📝 ${card.memo || "メモなし"}</div>
        `;
      } else {
        cardEl.innerHTML = `
          <div style="font-size: 1.8rem;">🎁</div>
          <div style="font-weight: 800; font-size: 0.85rem; color: var(--accent-gold);">${card.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${card.memo || "アイテム"}</div>
        `;
      }

      cardEl.addEventListener('click', () => {
        const newMemo = prompt("このカードのメモをへんしゅう（例: おかしの箱）:", card.memo || "");
        if (newMemo !== null) {
          StorageManager.updateMemo(card.id, newMemo);
          this.renderCollection();
        }
      });

      grid.appendChild(cardEl);
    });
  }

  // --- SCR-05: 対戦ロビー ---
  bindLobbyEvents() {
    document.getElementById('btn-create-room')?.addEventListener('click', () => {
      const roomCode = NetworkManager.generateRoomCode();
      this.network.createRoom(roomCode);
      
      const codeDisplay = document.getElementById('host-room-code');
      if (codeDisplay) codeDisplay.textContent = roomCode;

      document.getElementById('lobby-select-view').style.display = 'none';
      document.getElementById('lobby-host-wait-view').style.display = 'block';

      this.network.onMessageCallback = (data) => {
        if (data.type === 'JOIN_REQUEST') {
          // ゲストが参加 -> バトル開始
          this.startBattle(true);
        }
      };
    });

    document.getElementById('btn-join-room')?.addEventListener('click', () => {
      const input = document.getElementById('input-guest-code');
      if (input && input.value.length === 4) {
        this.network.joinRoom(input.value);
        this.startBattle(false);
      } else {
        alert("4けたの ルームコードを 入力してください");
      }
    });

    // CPU対戦デモボタン
    document.getElementById('btn-cpu-battle')?.addEventListener('click', () => {
      this.startCpuBattle();
    });
  }

  renderLobby() {
    document.getElementById('lobby-select-view').style.display = 'block';
    document.getElementById('lobby-host-wait-view').style.display = 'none';
  }

  // --- SCR-06: バトル ---
  startCpuBattle() {
    const deck = StorageManager.getDeck();
    const playerChar = deck.mainChar || BarcodeEngine.generateFromBarcode("4901234567890");
    const enemyChar = BarcodeEngine.generateFromBarcode("4909876543210");

    this.activeBattle = new BattleEngine(playerChar, deck.itemCard, enemyChar, null);
    this.renderBattleScreen();
    this.switchScreen('SCR-06');
  }

  startBattle(isHost) {
    const deck = StorageManager.getDeck();
    const playerChar = deck.mainChar || BarcodeEngine.generateFromBarcode("4901234567890");
    const enemyChar = BarcodeEngine.generateFromBarcode(isHost ? "4908888888888" : "4901111111111");

    this.activeBattle = new BattleEngine(playerChar, deck.itemCard, enemyChar, null);
    this.renderBattleScreen();
    this.switchScreen('SCR-06');
  }

  bindBattleEvents() {
    document.getElementById('btn-cmd-attack')?.addEventListener('click', () => this.handlePlayerAction('attack'));
    document.getElementById('btn-cmd-skill')?.addEventListener('click', () => this.handlePlayerAction('skill'));
    document.getElementById('btn-cmd-guard')?.addEventListener('click', () => this.handlePlayerAction('guard'));
    document.getElementById('btn-cmd-qte')?.addEventListener('click', () => this.triggerQteModal());

    document.getElementById('btn-qte-stop')?.addEventListener('click', () => this.resolveQte());
  }

  renderBattleScreen() {
    if (!this.activeBattle) return;
    const b = this.activeBattle;

    // 自分
    document.getElementById('p-name').textContent = b.player.name;
    document.getElementById('p-hp-bar').style.width = `${(b.player.currentHp / b.player.maxHp) * 100}%`;
    document.getElementById('p-sp-bar').style.width = `${b.player.sp}%`;
    document.getElementById('p-sprite').innerHTML = b.player.spriteSvg;
    document.getElementById('p-sprite').style.color = `var(--element-${b.player.element})`;

    // 敵
    document.getElementById('e-name').textContent = b.enemy.name;
    document.getElementById('e-hp-bar').style.width = `${(b.enemy.currentHp / b.enemy.maxHp) * 100}%`;
    document.getElementById('e-sp-bar').style.width = `${b.enemy.sp}%`;
    document.getElementById('e-sprite').innerHTML = b.enemy.spriteSvg;
    document.getElementById('e-sprite').style.color = `var(--element-${b.enemy.element})`;

    // コマンドボタン状態
    const btnSkill = document.getElementById('btn-cmd-skill');
    if (btnSkill) btnSkill.disabled = (b.player.sp < 100);

    const btnQte = document.getElementById('btn-cmd-qte');
    if (btnQte) btnQte.disabled = b.player.qteUsed;
  }

  handlePlayerAction(action, qteResult = false) {
    if (!this.activeBattle || this.activeBattle.isOver) return;

    // CPUの思考決定
    const enemyActions = ['attack', 'attack', 'guard'];
    if (this.activeBattle.enemy.sp >= 100) enemyActions.push('skill');
    const cpuAction = enemyActions[Math.floor(Math.random() * enemyActions.length)];

    const turnLog = this.activeBattle.processTurn(action, qteResult, cpuAction, false);
    
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

    // 成功判定 (中央 40% ~ 60% の枠内にポインターがあれば成功)
    const isSuccess = (this.qtePointerPos >= 40 && this.qtePointerPos <= 60);
    this.handlePlayerAction('qte', isSuccess);
  }

  // --- SCR-07: リザルト ---
  showResult(winner) {
    const title = document.getElementById('result-title');
    if (title) {
      if (winner === 'player') {
        title.textContent = "🎉 あなたの しょうり！";
        title.style.color = "var(--accent-gold)";
      } else if (winner === 'enemy') {
        title.textContent = "💧 あなたの まけ...";
        title.style.color = "var(--primary-pink)";
      } else {
        title.textContent = "🤝 ひきわけ！";
        title.style.color = "var(--secondary-cyan)";
      }
    }
    this.switchScreen('SCR-07');
  }
}
