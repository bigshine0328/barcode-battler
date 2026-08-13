/**
 * Network Communication Module (PeerJS WebRTC P2P & BroadcastChannel Fallback)
 * 2台のスマートフォン間での4桁ルームコード接続、誤入力エラー遮断、デッキデータ完全同期を統括
 */

export class NetworkManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.peer = null;
    this.connection = null;
    this.broadcastChannel = null;
    this.onMessageCallback = null;
    this.isConnected = false;
  }

  static generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * ルーム作成 (ホスト)
   */
  createRoom(code, myDeck, onSuccessCallback, onErrorCallback) {
    this.roomCode = code;
    this.isHost = true;
    this.myDeck = myDeck;
    this.disconnect();

    const peerId = `bcbtl_room_${code}`;

    // 同一端末複数タブ用のBroadcastChannelも併用
    this._initBroadcastChannel(code);

    if (typeof window.Peer !== 'undefined') {
      try {
        this.peer = new window.Peer(peerId, { debug: 1 });

        this.peer.on('open', (id) => {
          console.log("Host Peer opened with ID:", id);
          if (onSuccessCallback) onSuccessCallback(id);
        });

        this.peer.on('connection', (conn) => {
          this.connection = conn;
          this.isConnected = true;
          this._setupConnectionEvents(conn);
        });

        this.peer.on('error', (err) => {
          console.error("Host Peer error:", err);
          if (onErrorCallback) onErrorCallback("すでに使われているコードです。やり直してください。");
        });

      } catch (e) {
        console.error("PeerJS init error:", e);
      }
    }
  }

  /**
   * ルーム参加 (ゲスト)
   */
  joinRoom(code, myDeck, onSuccessCallback, onErrorCallback) {
    this.roomCode = code;
    this.isHost = false;
    this.myDeck = myDeck;
    this.disconnect();

    const peerId = `bcbtl_room_${code}`;
    this._initBroadcastChannel(code);

    // 接続タイムアウトタイマー (5秒)
    let hasConnected = false;
    const timeoutId = setTimeout(() => {
      if (!hasConnected && !this.isConnected) {
        this.disconnect();
        if (onErrorCallback) onErrorCallback("へやが見つかりませんでした。ルームコードを 確認してください。");
      }
    }, 5000);

    // BroadcastChannelからのリトライリクエスト
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'JOIN_REQUEST', guestDeck: myDeck });
    }

    if (typeof window.Peer !== 'undefined') {
      try {
        // ゲスト用Peer (ランダムID)
        this.peer = new window.Peer({ debug: 1 });

        this.peer.on('open', () => {
          const conn = this.peer.connect(peerId, { reliable: true });
          this.connection = conn;

          conn.on('open', () => {
            hasConnected = true;
            clearTimeout(timeoutId);
            this.isConnected = true;

            this._setupConnectionEvents(conn);
            // 自分のデッキデータをホストに送信
            this.send({ type: 'JOIN_REQUEST', guestDeck: myDeck });

            if (onSuccessCallback) onSuccessCallback();
          });

          conn.on('error', (err) => {
            clearTimeout(timeoutId);
            this.disconnect();
            if (onErrorCallback) onErrorCallback("へやが見つかりませんでした。ルームコードを 確認してください。");
          });
        });

        this.peer.on('error', (err) => {
          clearTimeout(timeoutId);
          this.disconnect();
          if (onErrorCallback) onErrorCallback("へやが見つかりませんでした。ルームコードを 確認してください。");
        });

      } catch (e) {
        console.error("Guest Peer error:", e);
      }
    }
  }

  _setupConnectionEvents(conn) {
    conn.on('data', (data) => {
      console.log("P2P Data received:", data);
      
      // ホストがリクエストを受け取った場合は自分のデッキを返し送信
      if (data.type === 'JOIN_REQUEST' && this.isHost) {
        this.send({ type: 'JOIN_ACCEPT', hostDeck: this.myDeck });
      }

      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    });

    conn.on('close', () => {
      this.isConnected = false;
      if (this.onMessageCallback) {
        this.onMessageCallback({ type: 'DISCONNECTED' });
      }
    });
  }

  _initBroadcastChannel(code) {
    try {
      this.broadcastChannel = new BroadcastChannel(`barcode_battler_bc_${code}`);
      this.broadcastChannel.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'JOIN_REQUEST' && this.isHost) {
          this.isConnected = true;
          this.send({ type: 'JOIN_ACCEPT', hostDeck: this.myDeck });
        } else if (data.type === 'JOIN_ACCEPT' && !this.isHost) {
          this.isConnected = true;
        }

        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      };
    } catch (e) {}
  }

  send(data) {
    if (this.connection && this.connection.open) {
      this.connection.send(data);
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(data);
    }
  }

  disconnect() {
    if (this.connection) {
      try { this.connection.close(); } catch (e) {}
      this.connection = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }
    this.isConnected = false;
  }
}
