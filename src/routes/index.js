const express = require('express');
const createAuthRoutes = require('./auth.routes');
const createProdutoRoutes = require('./produto.routes');
const createUsuarioRoutes = require('./usuario.routes');
const createPedidoRoutes = require('./pedido.routes');

function createRoutes(appCore) {
  const router = express.Router();

  router.use(createAuthRoutes(appCore));
  router.use(createProdutoRoutes(appCore));
  router.use(createUsuarioRoutes(appCore));
  router.use(createPedidoRoutes(appCore));

  return router;
}

module.exports = createRoutes;