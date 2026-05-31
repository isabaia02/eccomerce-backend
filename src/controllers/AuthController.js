const BaseController = require('./BaseController');

class AuthController extends BaseController {
  constructor(usuarioModel) {
    super(usuarioModel);
  }

  async regenerarSessao(req) {
    return new Promise((resolve, reject) => {
      req.session.regenerate(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  async salvarSessao(req) {
    return new Promise((resolve, reject) => {
      req.session.save(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  login = async (req, res) => this.run(res, async () => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw new Error('Email e senha são obrigatórios');
    }

    const usuarioAutenticado = await this.model.autenticar(email, senha);

    await this.regenerarSessao(req);

    req.session.usuario = {
      id: usuarioAutenticado._id.toString(),
      nome: usuarioAutenticado.nome,
      email: usuarioAutenticado.email
    };

    await this.salvarSessao(req);

    res.json({ sucesso: true, mensagem: 'Login realizado com sucesso', usuario: req.session.usuario });
  });

  logout = async (req, res) => this.run(res, async () => {
    if (!req.session) {
      res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
      return;
    }

    await new Promise((resolve, reject) => {
      req.session.destroy(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
  });

  sessao = async (req, res) => this.run(res, async () => {
    res.json({ autenticado: Boolean(req.session.usuario), usuario: req.session.usuario || null });
  });
}

module.exports = AuthController;