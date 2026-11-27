// models/Player.js
const { PieceColor, Difficulty } = require('./enums');

class Player {
  constructor(id, name, color, isAI, difficulty) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.ai = !!isAI;
    this.difficulty = difficulty || null;
  }

  static human(id, name, color) {
    return new Player(id, name, color, false, null);
  }

  static aiPlayer(color, difficulty) {
    return new Player(
      'ai-' + color.toLowerCase(),
      `ChessNova AI (${difficulty.name})`,
      color,
      true,
      difficulty
    );
  }

  isAI() {
    return this.ai;
  }
}

module.exports = Player;
