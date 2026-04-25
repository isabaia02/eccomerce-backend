const { MongoClient } = require('mongodb');
const Logger = require('../utils/logger');

const logger = new Logger();

class DatabaseConnection {
  constructor(url = 'mongodb://localhost:27017', dbName = 'ecommerce') {
    this.url = url;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.url);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      logger.log(`Conectado ao banco de dados: ${this.dbName}`);
      return this.db;
    } catch (error) {
      logger.error(`Erro ao conectar ao banco de dados: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        logger.log('Desconectado do banco de dados');
      }
    } catch (error) {
      logger.error(`Erro ao desconectar: ${error.message}`);
      throw error;
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Banco de dados não conectado. Execute connect() primeiro.');
    }
    return this.db;
  }

  getCollection(collectionName) {
    const db = this.getDatabase();
    return db.collection(collectionName);
  }
}

module.exports = DatabaseConnection;
