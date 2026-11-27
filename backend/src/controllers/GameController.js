// controllers/GameController.js
class GameController {
  constructor(gameService) {
    this.gameService = gameService;
  }

  createGame = (req, res, next) => {
    try {
      const response = this.gameService.createGame(req.body || {});
      res.status(201).json(response);
    } catch (e) { next(e); }
  };

  getGame = (req, res, next) => {
    try {
      const response = this.gameService.getGameResponse(req.params.gameId);
      res.json(response);
    } catch (e) { next(e); }
  };

  submitMove = (req, res, next) => {
    try {
      const response = this.gameService.submitMove(req.params.gameId, req.body);
      res.json(response);
    } catch (e) { next(e); }
  };

  undoMove = (req, res, next) => {
    try {
      const response = this.gameService.undoMove(req.params.gameId);
      res.json(response);
    } catch (e) { next(e); }
  };

  restartGame = (req, res, next) => {
    try {
      const response = this.gameService.restartGame(req.params.gameId);
      res.json(response);
    } catch (e) { next(e); }
  };

  getHistory = (req, res, next) => {
    try {
      const response = this.gameService.getMoveHistory(req.params.gameId);
      res.json(response);
    } catch (e) { next(e); }
  };

  getLegalMoves = (req, res, next) => {
    try {
      const response = this.gameService.getLegalMoves(req.params.gameId, req.query.square);
      res.json(response);
    } catch (e) { next(e); }
  };
}

module.exports = GameController;
