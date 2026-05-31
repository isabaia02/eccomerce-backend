class BaseController {
  constructor(model) {
    this.model = model;
  }

  sendError(res, error) {
    const statusCode = error.statusCode
      || (error.message.includes('não encontrado') ? 404 : 400);
    return res.status(statusCode).json({
      erro: true,
      mensagem: error.message
    });
  }

  async run(res, handler) {
    try {
      await handler();
    } catch (error) {
      return this.sendError(res, error);
    }

    return null;
  }
}

module.exports = BaseController;