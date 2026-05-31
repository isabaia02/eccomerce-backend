const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const requireAuth = require('../middlewares/authMiddleware');

function createUsuarioRoutes(appCore) {
  const router = express.Router();
  const controller = new UsuarioController(appCore.getUsuario());

  router.get('/usuarios', requireAuth, controller.listar);
  router.get('/usuarios/:id', requireAuth, controller.obterPorId);
  router.post('/usuarios', controller.criar);
  router.put('/usuarios/:id', requireAuth, controller.atualizar);
  router.delete('/usuarios/:id', requireAuth, controller.remover);

  return router;
}

module.exports = createUsuarioRoutes;