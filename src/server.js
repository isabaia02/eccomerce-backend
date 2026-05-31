const Logger = require('./utils/logger');
const EcommerceApp = require('./index');
const createApp = require('./app');

async function startServer() {
  const logger = new Logger();
  const appCore = new EcommerceApp();

  await appCore.inicializar();

  const app = createApp(appCore);
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    logger.log(`Servidor Express iniciado na porta ${port}`);
  });

  return { app, server, appCore, port };
}

if (require.main === module) {
  startServer().catch(error => {
    const logger = new Logger();
    logger.error('Falha ao iniciar servidor HTTP', error);
    process.exit(1);
  });
}

module.exports = {
  startServer
};