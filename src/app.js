const express = require('express');
const session = require('express-session');
const Logger = require('./utils/logger');
const createRoutes = require('./routes');

function createApp(appCore) {
  const logger = new Logger();
  const app = express();

  app.use(express.json());
  app.use(
    session({
      secret: 'ecommerce-secret-session',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax'
      }
    })
  );

  app.use((req, res, next) => {
    logger.log(`${req.method} ${req.path}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ sucesso: true, mensagem: 'API do e-commerce em execução' });
  });

  app.use('/api', createRoutes(appCore));

  app.use((req, res) => {
    res.status(404).json({ erro: true, mensagem: 'Rota não encontrada' });
  });

  return app;
}

module.exports = createApp;