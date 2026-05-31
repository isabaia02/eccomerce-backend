const express = require('express');
const ProdutoController = require('../controllers/ProdutoController');
const requireAuth = require('../middlewares/authMiddleware');

function createProdutoRoutes(appCore) {
  const router = express.Router();
  const controller = new ProdutoController(appCore.getProduto());

  router.get('/produtos', requireAuth, controller.listar);
  router.get('/produtos/:id', requireAuth, controller.obterPorId);
  router.post('/produtos', requireAuth, controller.criar);
  router.put('/produtos/:id', requireAuth, controller.atualizar);
  router.delete('/produtos/:id', requireAuth, controller.remover);

  return router;
}

module.exports = createProdutoRoutes;