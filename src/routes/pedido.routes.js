const express = require('express');
const PedidoController = require('../controllers/PedidoController');
const requireAuth = require('../middlewares/authMiddleware');

function createPedidoRoutes(appCore) {
  const router = express.Router();
  const controller = new PedidoController(appCore.getPedido());

  router.get('/pedidos', requireAuth, controller.listar);
  router.get('/pedidos/:id', requireAuth, controller.obterPorId);
  router.get('/pedidos/:id/resumo', requireAuth, controller.resumo);
  router.post('/pedidos', requireAuth, controller.criar);
  router.post('/pedidos/:id/finalizar', requireAuth, controller.finalizar);
  router.patch('/pedidos/:id/status', requireAuth, controller.atualizarStatus);

  return router;
}

module.exports = createPedidoRoutes;