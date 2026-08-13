/**
 * Network Communication Module (Deck Handshake & Room Code Synchronization)
 */

export class NetworkManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.channel = null;
    this.onMessageCallback = null;
    this.isConnected = false;
  }

  static generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  createRoom(code, myDeck) {
    this.roomCode = code;
    this.isHost = true;
    this.myDeck = myDeck;
    this._initChannel(code);
  }

  joinRoom(code, myDeck) {
    this.roomCode = code;
    this.isHost = false;
    this.myDeck = myDeck;
    this._initChannel(code);
    
    // ホストへ接続リクエストと自分のデッキデータを送信
    this.send({ type: 'JOIN_REQUEST', guestDeck: myDeck });
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
        // ホストからゲストへアクセプトとホストのデッキデータを送信
        this.send({ type: 'JOIN_ACCEPT', hostDeck: this.myDeck });
      } else if (data.type === 'JOIN_ACCEPT' && !this.isHost) {
        this.isConnected = true;
      }

      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    };
  }

  send(data) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
  }

  disconnect() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.isConnected = false;
  }
}
