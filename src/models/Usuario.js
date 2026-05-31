const { ObjectId } = require('mongodb');
const crypto = require('crypto');
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

  normalizarEmail(email) {
    return String(email).trim().toLowerCase();
  }

  gerarHashSenha(senha) {
    const iterations = 120000;
    const keyLength = 64;
    const digest = 'sha512';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(senha, salt, iterations, keyLength, digest).toString('hex');

    return `pbkdf2$${iterations}$${salt}$${hash}`;
  }

  validarSenhaHash(senhaDigitada, senhaArmazenada) {
    if (typeof senhaArmazenada !== 'string' || senhaArmazenada.length === 0) {
      return false;
    }

    if (!senhaArmazenada.startsWith('pbkdf2$')) {
      return senhaDigitada === senhaArmazenada;
    }

    const partes = senhaArmazenada.split('$');
    if (partes.length !== 4) {
      return false;
    }

    const [, iterationsTexto, salt, hashEsperado] = partes;
    const iterations = Number.parseInt(iterationsTexto, 10);

    if (!Number.isInteger(iterations) || !salt || !hashEsperado) {
      return false;
    }

    const hashCalculado = crypto.pbkdf2Sync(senhaDigitada, salt, iterations, hashEsperado.length / 2, 'sha512').toString('hex');

    if (hashCalculado.length !== hashEsperado.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(hashCalculado, 'hex'), Buffer.from(hashEsperado, 'hex'));
  }

  async inserir(usuarioData) {
    try {
      Validator.validateRequired(usuarioData, ['nome', 'email', 'telefone']);
      Validator.validateString(usuarioData.nome, 'Nome', 3);
      const emailNormalizado = this.normalizarEmail(usuarioData.email);
      Validator.validateEmail(emailNormalizado);
      Validator.validateString(usuarioData.telefone, 'Telefone', 8);

      if (usuarioData.senha !== undefined && usuarioData.senha !== null && usuarioData.senha !== '') {
        Validator.validateString(usuarioData.senha, 'Senha', 4);
      }

      const collection = await this.getCollection();
      const emailExistente = await collection.findOne({ email: emailNormalizado });
      
      if (emailExistente) {
        throw new Error(`Email já cadastrado: ${usuarioData.email}`);
      }

      const senhaHash = usuarioData.senha ? this.gerarHashSenha(usuarioData.senha) : null;

      const usuario = {
        nome: usuarioData.nome.trim(),
        email: emailNormalizado,
        telefone: usuarioData.telefone.trim(),
        endereco: usuarioData.endereco || null,
        cpf: usuarioData.cpf || null,
        senha: senhaHash,
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
      const emailNormalizado = this.normalizarEmail(email);
      Validator.validateEmail(emailNormalizado);

      const collection = await this.getCollection();
      const usuario = await collection.findOne({ 
        email: emailNormalizado,
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

  async autenticar(email, senha) {
    try {
      const emailNormalizado = this.normalizarEmail(email);
      Validator.validateEmail(emailNormalizado);
      Validator.validateString(senha, 'Senha', 1);

      const usuario = await this.buscarPorEmail(emailNormalizado);

      if (!usuario || !this.validarSenhaHash(senha, usuario.senha)) {
        const error = new Error('Credenciais inválidas');
        error.statusCode = 401;
        throw error;
      }

      if (!usuario.senha.startsWith('pbkdf2$')) {
        const collection = await this.getCollection();
        const senhaHash = this.gerarHashSenha(senha);
        await collection.updateOne(
          { _id: usuario._id },
          { $set: { senha: senhaHash, dataAtualizacao: new Date() } }
        );
        usuario.senha = senhaHash;
      }

      return usuario;
    } catch (error) {
      this.logger.error(`Erro ao autenticar usuário: ${error.message}`, error);
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
        const emailNormalizado = this.normalizarEmail(atualizacoes.email);
        Validator.validateEmail(emailNormalizado);
        const emailExistente = await collection.findOne({ 
          email: emailNormalizado,
          _id: { $ne: objectId }
        });
        
        if (emailExistente) {
          throw new Error(`Email já cadastrado: ${atualizacoes.email}`);
        }
        
        atualizacoes.email = emailNormalizado;
      }

      if (Object.prototype.hasOwnProperty.call(atualizacoes, 'senha')) {
        if (atualizacoes.senha === undefined || atualizacoes.senha === null || atualizacoes.senha === '') {
          throw new Error('Senha não pode ser vazia');
        }

        Validator.validateString(atualizacoes.senha, 'Senha', 4);
        atualizacoes.senha = this.gerarHashSenha(atualizacoes.senha);
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
