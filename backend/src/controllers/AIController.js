// controllers/AIController.js
class AIController {
  constructor(aiService) {
    this.aiService = aiService;
  }

  requestAIMove = (req, res, next) => {
    try {
      const response = this.aiService.triggerAIMove(req.params.gameId);
      res.json(response);
    } catch (e) { next(e); }
  };
}

module.exports = AIController;
