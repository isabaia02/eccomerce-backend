const { ObjectId } = require('mongodb');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

class Produto {
  constructor(database) {
    this.db = database;
    this.logger = new Logger();
    this.collectionName = 'produtos';
  }

  async getCollection() {
    return this.db.getCollection(this.collectionName);
  }

  async inserir(produtoData) {
    try {
      Validator.validateRequired(produtoData, ['nome', 'descricao', 'preco', 'estoque']);
      Validator.validateString(produtoData.nome, 'Nome', 3);
      Validator.validateString(produtoData.descricao, 'Descrição', 5);
      Validator.validatePositiveNumber(produtoData.preco, 'Preço');
      Validator.validatePositiveNumber(produtoData.estoque, 'Estoque');

      const produto = {
        nome: produtoData.nome.trim(),
        descricao: produtoData.descricao.trim(),
        preco: produtoData.preco,
        estoque: produtoData.estoque,
        categoria: produtoData.categoria || 'Sem categoria',
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        ativo: true
      };

      const collection = await this.getCollection();
      const resultado = await collection.insertOne(produto);
      
      this.logger.log(`Produto inserido: ${resultado.insertedId}`);
      return resultado.insertedId;
    } catch (error) {
      this.logger.error(`Erro ao inserir produto: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorId(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const collection = await this.getCollection();
      const produto = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!produto) {
        this.logger.warn(`Produto não encontrado com ID: ${id}`);
        return null;
      }
      
      return produto;
    } catch (error) {
      this.logger.error(`Erro ao buscar produto por ID: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorNome(nome) {
    try {
      Validator.validateString(nome, 'Nome', 1);
      
      const collection = await this.getCollection();
      const produtos = await collection
        .find({ 
          nome: { $regex: nome, $options: 'i' },
          ativo: true
        })
        .toArray();

      this.logger.log(`${produtos.length} produto(s) encontrado(s) com nome: ${nome}`);
      return produtos;
    } catch (error) {
      this.logger.error(`Erro ao buscar produto por nome: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorCategoria(categoria) {
    try {
      Validator.validateString(categoria, 'Categoria', 1);

      const collection = await this.getCollection();
      const produtos = await collection
        .find({ 
          categoria: categoria,
          ativo: true
        })
        .toArray();

      return produtos;
    } catch (error) {
      this.logger.error(`Erro ao buscar produto por categoria: ${error.message}`, error);
      throw error;
    }
  }

  async atualizar(id, atualizacoes) {
    try {
      const idString = typeof id === 'object' ? id.toString() : String(id);
      
      if (!ObjectId.isValid(idString)) {
        throw new Error(`ID inválido: ${idString}`);
      }

      // Validar apenas os campos que estão sendo atualizados
      if (atualizacoes.nome) {
        Validator.validateString(atualizacoes.nome, 'Nome', 3);
      }
      if (atualizacoes.preco !== undefined) {
        Validator.validatePositiveNumber(atualizacoes.preco, 'Preço');
      }
      if (atualizacoes.estoque !== undefined) {
        Validator.validatePositiveNumber(atualizacoes.estoque, 'Estoque');
      }

      atualizacoes.dataAtualizacao = new Date();

      const collection = await this.getCollection();
      const objectId = new ObjectId(idString);
      
      const produtoExistente = await collection.findOne({ _id: objectId });
      if (!produtoExistente) {
        throw new Error(`Produto não encontrado com ID: ${idString}`);
      }

      await collection.updateOne(
        { _id: objectId },
        { $set: atualizacoes }
      );

      const produtoAtualizado = await collection.findOne({ _id: objectId });

      this.logger.log(`Produto atualizado: ${idString}`);
      return produtoAtualizado;
    } catch (error) {
      this.logger.error(`Erro ao atualizar produto: ${error.message}`, error);
      throw error;
    }
  }

  async deletar(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const collection = await this.getCollection();
      const resultado = await collection.deleteOne({ _id: new ObjectId(id) });

      if (resultado.deletedCount === 0) {
        throw new Error(`Produto não encontrado com ID: ${id}`);
      }

      this.logger.log(`Produto deletado: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao deletar produto: ${error.message}`, error);
      throw error;
    }
  }

  async listarTodos() {
    try {
      const collection = await this.getCollection();
      const produtos = await collection.find({ ativo: true }).toArray();
      
      return produtos;
    } catch (error) {
      this.logger.error(`Erro ao listar todos os produtos: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = Produto;
