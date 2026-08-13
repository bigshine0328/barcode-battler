/**
 * Network Communication Module
 * 4桁ルームコード接続、BroadcastChannel API & PeerJS 統合によるリアルタイム同期
 */

export class NetworkManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.channel = null;
    this.onMessageCallback = null;
    this.isConnected = false;
  }

  /**
   * 4桁ルームコードを自動生成
   */
  static generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * ルーム作成 (ホスト)
   */
  createRoom(code) {
    this.roomCode = code;
    this.isHost = true;
    this._initChannel(code);
  }

  /**
   * ルーム参加 (ゲスト)
   */
  joinRoom(code) {
    this.roomCode = code;
    this.isHost = false;
    this._initChannel(code);
    
    // ホストへ接続シグナル送信
    this.send({ type: 'JOIN_REQUEST', guestId: Math.random().toString(36).substring(7) });
  }

  _initChannel(code) {
    if (this.channel) {
      this.channel.close();
    }
    this.channel = new BroadcastChannel(`barcode_battler_room_${code}`);
    this.channel.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'JOIN_REQUEST' && this.isHost) {
        this.isConnected = true;
        this.send({ type: 'JOIN_ACCEPT', hostId: 'host' });
      } else if (data.type === 'JOIN_ACCEPT' && !this.isHost) {
        this.isConnected = true;
      }

      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    };
  }

  /**
   * メッセージ送信
   */
  send(data) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
  }

  /**
   * 切断処理
   */
  disconnect() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.isConnected = false;
  }
}
