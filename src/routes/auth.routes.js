const express = require('express');
const AuthController = require('../controllers/AuthController');

function createAuthRoutes(appCore) {
  const router = express.Router();
  const controller = new AuthController(appCore.getUsuario());

  router.post('/login', controller.login);
  router.post('/logout', controller.logout);
  router.get('/sessao', controller.sessao);

  return router;
}

module.exports = createAuthRoutes;