const { ObjectId } = require('mongodb');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

class Usuario {
  constructor(database) {
    this.db = database;
    this.logger = new Logger();
    this.collectionName = 'usuarios';
  }

  async getCollection() {
    return this.db.getCollection(this.collectionName);
  }

  async inserir(usuarioData) {
    try {
      Validator.validateRequired(usuarioData, ['nome', 'email', 'telefone']);
      Validator.validateString(usuarioData.nome, 'Nome', 3);
      Validator.validateEmail(usuarioData.email);
      Validator.validateString(usuarioData.telefone, 'Telefone', 8);

      const collection = await this.getCollection();
      const emailExistente = await collection.findOne({ email: usuarioData.email.toLowerCase() });
      
      if (emailExistente) {
        throw new Error(`Email já cadastrado: ${usuarioData.email}`);
      }

      const usuario = {
        nome: usuarioData.nome.trim(),
        email: usuarioData.email.toLowerCase().trim(),
        telefone: usuarioData.telefone.trim(),
        endereco: usuarioData.endereco || null,
        cpf: usuarioData.cpf || null,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        ativo: true
      };

      const resultado = await collection.insertOne(usuario);
      
      this.logger.log(`Usuário inserido: ${resultado.insertedId}`);
      return resultado.insertedId;
    } catch (error) {
      this.logger.error(`Erro ao inserir usuário: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorId(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const collection = await this.getCollection();
      const usuario = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!usuario) {
        this.logger.warn(`Usuário não encontrado com ID: ${id}`);
        return null;
      }
      
      return usuario;
    } catch (error) {
      this.logger.error(`Erro ao buscar usuário por ID: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorEmail(email) {
    try {
      Validator.validateEmail(email);

      const collection = await this.getCollection();
      const usuario = await collection.findOne({ 
        email: email.toLowerCase(),
        ativo: true
      });

      if (!usuario) {
        this.logger.warn(`Usuário não encontrado com email: ${email}`);
        return null;
      }

      return usuario;
    } catch (error) {
      this.logger.error(`Erro ao buscar usuário por email: ${error.message}`, error);
      throw error;
    }
  }

  async buscarPorNome(nome) {
    try {
      Validator.validateString(nome, 'Nome', 1);

      const collection = await this.getCollection();
      const usuarios = await collection
        .find({ 
          nome: { $regex: nome, $options: 'i' },
          ativo: true
        })
        .toArray();

      return usuarios;
    } catch (error) {
      this.logger.error(`Erro ao buscar usuário por nome: ${error.message}`, error);
      throw error;
    }
  }

  async atualizar(id, atualizacoes) {
    try {
      const idString = typeof id === 'object' ? id.toString() : String(id);
      
      if (!ObjectId.isValid(idString)) {
        throw new Error(`ID inválido: ${idString}`);
      }

      const collection = await this.getCollection();
      const objectId = new ObjectId(idString);

      if (atualizacoes.email) {
        Validator.validateEmail(atualizacoes.email);
        const emailExistente = await collection.findOne({ 
          email: atualizacoes.email.toLowerCase(),
          _id: { $ne: objectId }
        });
        
        if (emailExistente) {
          throw new Error(`Email já cadastrado: ${atualizacoes.email}`);
        }
        
        atualizacoes.email = atualizacoes.email.toLowerCase();
      }

      if (atualizacoes.nome) {
        Validator.validateString(atualizacoes.nome, 'Nome', 3);
      }

      atualizacoes.dataAtualizacao = new Date();

      const usuarioExistente = await collection.findOne({ _id: objectId });
      if (!usuarioExistente) {
        throw new Error(`Usuário não encontrado com ID: ${idString}`);
      }

      await collection.updateOne(
        { _id: objectId },
        { $set: atualizacoes }
      );

      const usuarioAtualizado = await collection.findOne({ _id: objectId });

      this.logger.log(`Usuário atualizado: ${idString}`);
      return usuarioAtualizado;
    } catch (error) {
      this.logger.error(`Erro ao atualizar usuário: ${error.message}`, error);
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
        throw new Error(`Usuário não encontrado com ID: ${id}`);
      }

      this.logger.log(`Usuário deletado: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao deletar usuário: ${error.message}`, error);
      throw error;
    }
  }

  async listarTodos() {
    try {
      const collection = await this.getCollection();
      const usuarios = await collection.find({ ativo: true }).toArray();
      
      return usuarios;
    } catch (error) {
      this.logger.error(`Erro ao listar todos os usuários: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = Usuario;
