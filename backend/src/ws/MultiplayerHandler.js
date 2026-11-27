// ws/MultiplayerHandler.js
const { PieceType } = require('../models/enums');

class MultiplayerHandler {
  constructor(gameService, io) {
    this.gameService = gameService;
    this.io = io;

    // roomCode -> { gameId, sockets: Set }
    this.rooms = new Map();
  }

  setup() {
    this.io.on('connection', (socket) => {
      console.log('WebSocket connected:', socket.id);

      socket.on('message', (data) => {
        try {
          const payload = typeof data === 'string' ? JSON.parse(data) : data;
          this._handleMessage(socket, payload);
        } catch (e) {
          console.error('Error processing WS message', e);
          socket.emit('message', JSON.stringify({ type: 'ERROR', message: e.message }));
        }
      });

      socket.on('disconnect', () => {
        // Remove socket from all rooms
        for (const [roomCode, room] of this.rooms) {
          room.sockets.delete(socket.id);
        }
        console.log('WebSocket disconnected:', socket.id);
      });
    });
  }

  _handleMessage(socket, payload) {
    const { action, roomCode } = payload;
    if (!roomCode) return;

    // Ensure room exists
    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, { gameId: null, sockets: new Set() });
    }
    const room = this.rooms.get(roomCode);
    room.sockets.add(socket.id);
    socket.join(roomCode);

    switch (action) {
      case 'JOIN':
        this._handleJoin(socket, roomCode, payload);
        break;
      case 'MOVE':
        this._handleMove(socket, roomCode, payload);
        break;
      case 'RESTART':
        this._handleRestart(socket, roomCode);
        break;
      default:
        console.debug('Unknown action:', action);
    }
  }

  _handleJoin(socket, roomCode, payload) {
    const room = this.rooms.get(roomCode);
    if (payload.gameId) {
      room.gameId = payload.gameId;
    }

    if (room.gameId) {
      const state = this.gameService.getGameResponse(room.gameId);
      this.io.to(roomCode).emit('message', JSON.stringify({
        type: 'SYNC',
        roomCode,
        state,
        playerCount: room.sockets.size
      }));
    }
  }

  _handleMove(socket, roomCode, payload) {
    const room = this.rooms.get(roomCode);
    if (!room.gameId) {
      socket.emit('message', JSON.stringify({ type: 'ERROR', message: 'Room has no active game' }));
      return;
    }

    try {
      const req = {
        from: payload.from,
        to: payload.to,
        promotionType: payload.promotionType || null
      };
      const updated = this.gameService.submitMove(room.gameId, req);
      this.io.to(roomCode).emit('message', JSON.stringify({
        type: 'MOVE_MADE',
        roomCode,
        state: updated
      }));
    } catch (e) {
      socket.emit('message', JSON.stringify({ type: 'ERROR', message: e.message }));
    }
  }

  _handleRestart(socket, roomCode) {
    const room = this.rooms.get(roomCode);
    if (room.gameId) {
      const restarted = this.gameService.restartGame(room.gameId);
      this.io.to(roomCode).emit('message', JSON.stringify({
        type: 'SYNC',
        roomCode,
        state: restarted
      }));
    }
  }
}

module.exports = MultiplayerHandler;
