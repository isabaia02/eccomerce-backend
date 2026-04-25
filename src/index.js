const DatabaseConnection = require('./database/connection');
const Produto = require('./classes/Produto');
const Usuario = require('./classes/Usuario');
const Pedido = require('./classes/Pedido');
const Logger = require('./utils/logger');

class EcommerceApp {
  constructor() {
    this.db = new DatabaseConnection('mongodb://localhost:27017', 'ecommerce');
    this.logger = new Logger();
    this.produto = null;
    this.usuario = null;
    this.pedido = null;
  }

  async inicializar() {
    try {
      await this.db.connect();
      
      this.produto = new Produto(this.db);
      this.usuario = new Usuario(this.db);
      this.pedido = new Pedido(this.db);
      
      this.logger.log('Aplicação E-commerce Inicializada');
      return true;
    } catch (error) {
      this.logger.error('Erro ao inicializar aplicação', error);
      throw error;
    }
  }

  async encerrar() {
    try {
      await this.db.disconnect();
      this.logger.log('Aplicação encerrada');
    } catch (error) {
      this.logger.error('Erro ao encerrar aplicação', error);
      throw error;
    }
  }

  getProduto() {
    return this.produto;
  }

  getUsuario() {
    return this.usuario;
  }

  getPedido() {
    return this.pedido;
  }
}

module.exports = EcommerceApp;

// if (require.main === module) {
//   const app = new EcommerceApp();
  
//   app.inicializar().then(() => {
//     console.log('\nBiblioteca E-commerce pronta para uso!');
//     console.log('Importe EcommerceApp e acesse:');
//     console.log('  - app.getProduto()  // Gerenciar produtos');
//     console.log('  - app.getUsuario()  // Gerenciar usuários');
//     console.log('  - app.getPedido()   // Gerenciar pedidos');
//   }).catch(error => {
//     console.error('Erro fatal:', error.message);
//     process.exit(1);
//   });
// }
