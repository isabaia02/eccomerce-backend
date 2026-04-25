const { ObjectId } = require('mongodb');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

class Pedido {
  constructor(database) {
    this.db = database;
    this.logger = new Logger();
    this.collectionName = 'pedidos';
  }

  async getCollection() {
    return this.db.getCollection(this.collectionName);
  }

  async inserir(pedidoData) {
    try {
      Validator.validateRequired(pedidoData, ['usuarioId', 'itens']);
      
      if (!Array.isArray(pedidoData.itens) || pedidoData.itens.length === 0) {
        throw new Error('Itens deve ser um array com pelo menos um produto');
      }

      let totalPedido = 0;
      for (const item of pedidoData.itens) {
        if (!ObjectId.isValid(item.produtoId)) {
          throw new Error(`ID de produto inválido: ${item.produtoId}`);
        }
        if (!item.quantidade || item.quantidade <= 0) {
          throw new Error('Quantidade deve ser um número positivo');
        }
        if (!item.preco || item.preco <= 0) {
          throw new Error('Preço deve ser um número positivo');
        }
        totalPedido += item.quantidade * item.preco;
      }

      if (!ObjectId.isValid(pedidoData.usuarioId)) {
        throw new Error(`ID de usuário inválido: ${pedidoData.usuarioId}`);
      }

      const pedido = {
        usuarioId: new ObjectId(pedidoData.usuarioId),
        itens: pedidoData.itens.map(item => ({
          produtoId: new ObjectId(item.produtoId),
          quantidade: item.quantidade,
          preco: item.preco,
          subtotal: item.quantidade * item.preco
        })),
        totalPedido: totalPedido,
        status: 'pendente',
        endereco: pedidoData.endereco || null,
        observacoes: pedidoData.observacoes || null,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };

      const collection = await this.getCollection();
      const resultado = await collection.insertOne(pedido);
      
      this.logger.log(`Pedido inserido: ${resultado.insertedId}`);
      return resultado.insertedId;
    } catch (error) {
      this.logger.error(`Erro ao inserir pedido: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorId(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const collection = await this.getCollection();
      const pedido = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!pedido) {
        this.logger.warn(`Pedido não encontrado com ID: ${id}`);
        return null;
      }
      
      return pedido;
    } catch (error) {
      this.logger.error(`Erro ao buscar pedido por ID: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorUsuario(usuarioId) {
    try {
      if (!ObjectId.isValid(usuarioId)) {
        throw new Error(`ID de usuário inválido: ${usuarioId}`);
      }

      const collection = await this.getCollection();
      const pedidos = await collection
        .find({ usuarioId: new ObjectId(usuarioId) })
        .toArray();

      this.logger.log(`${pedidos.length} pedido(s) encontrado(s) para usuário: ${usuarioId}`);
      return pedidos;
    } catch (error) {
      this.logger.error(`Erro ao buscar pedidos por usuário: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorStatus(status) {
    try {
      const statusValidos = ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'];
      
      if (!statusValidos.includes(status)) {
        throw new Error(`Status inválido. Valores aceitos: ${statusValidos.join(', ')}`);
      }

      const collection = await this.getCollection();
      const pedidos = await collection
        .find({ status: status })
        .toArray();

      return pedidos;
    } catch (error) {
      this.logger.error(`Erro ao buscar pedidos por status: ${error.message}`, error);
      throw error;
    }
  }

  async atualizarStatus(id, novoStatus) {
    try {
      const idString = typeof id === 'object' ? id.toString() : String(id);
      
      if (!ObjectId.isValid(idString)) {
        throw new Error(`ID inválido: ${idString}`);
      }

      const statusValidos = ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'];
      
      if (!statusValidos.includes(novoStatus)) {
        throw new Error(`Status inválido. Valores aceitos: ${statusValidos.join(', ')}`);
      }

      const collection = await this.getCollection();
      const objectId = new ObjectId(idString);
      
      const pedidoExistente = await collection.findOne({ _id: objectId });
      if (!pedidoExistente) {
        throw new Error(`Pedido não encontrado com ID: ${idString}`);
      }

      const resultado = await collection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            status: novoStatus,
            dataAtualizacao: new Date()
          }
        }
      );

      if (resultado.matchedCount === 0) {
        throw new Error(`Pedido não encontrado com ID: ${idString}`);
      }

      const pedidoAtualizado = await collection.findOne({ _id: objectId });
      
      this.logger.log(`Status do pedido ${idString} atualizado para: ${novoStatus}`);
      return pedidoAtualizado;
    } catch (error) {
      this.logger.error(`Erro ao atualizar status do pedido: ${error.message}`, error);
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
        throw new Error(`Pedido não encontrado com ID: ${id}`);
      }

      this.logger.log(`Pedido deletado: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao deletar pedido: ${error.message}`, error);
      throw error;
    }
  }

  async listarTodos() {
    try {
      const collection = await this.getCollection();
      const pedidos = await collection.find({}).toArray();
      
      return pedidos;
    } catch (error) {
      this.logger.error(`Erro ao listar todos os pedidos: ${error.message}`, error);
      throw error;
    }
  }

  async obterResumo(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const collection = await this.getCollection();
      const pedido = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!pedido) {
        throw new Error(`Pedido não encontrado com ID: ${id}`);
      }

      return {
        id: pedido._id,
        usuarioId: pedido.usuarioId,
        quantidadeItens: pedido.itens.length,
        totalPedido: pedido.totalPedido,
        status: pedido.status,
        dataCriacao: pedido.dataCriacao
      };
    } catch (error) {
      this.logger.error(`Erro ao obter resumo do pedido: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = Pedido;
