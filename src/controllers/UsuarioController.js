const BaseController = require('./BaseController');

class UsuarioController extends BaseController {
  constructor(usuarioModel) {
    super(usuarioModel);
  }

  listar = async (req, res) => this.run(res, async () => {
    const { nome, email } = req.query;

    let dados = await this.model.listarTodos();
    if (nome) {
      dados = await this.model.buscarPorNome(nome);
    } else if (email) {
      const encontrado = await this.model.buscarPorEmail(email);
      dados = encontrado ? [encontrado] : [];
    }

    res.json({ sucesso: true, dados });
  });

  obterPorId = async (req, res) => this.run(res, async () => {
    const dados = await this.model.buscarPorId(req.params.id);
    if (!dados) {
      throw new Error('Usuário não encontrado');
    }

    res.json({ sucesso: true, dados });
  });

  criar = async (req, res) => this.run(res, async () => {
    if (!req.body.senha) {
      throw new Error('Senha é obrigatória para cadastro de usuário');
    }

    const id = await this.model.inserir(req.body);
    res.status(201).json({ sucesso: true, mensagem: 'Usuário criado com sucesso', id });
  });

  atualizar = async (req, res) => this.run(res, async () => {
    const dados = await this.model.atualizar(req.params.id, req.body);
    res.json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso', dados });
  });

  remover = async (req, res) => this.run(res, async () => {
    await this.model.deletar(req.params.id);
    res.json({ sucesso: true, mensagem: 'Usuário removido com sucesso' });
  });
}

module.exports = UsuarioController;