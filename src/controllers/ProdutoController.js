const BaseController = require('./BaseController');

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

class ProdutoController extends BaseController {
  constructor(produtoModel) {
    super(produtoModel);
  }

  listar = async (req, res) => this.run(res, async () => {
    const { nome, categoria } = req.query;

    let dados = await this.model.listarTodos();
    if (nome) {
      dados = await this.model.buscarPorNome(nome);
    } else if (categoria) {
      dados = await this.model.buscarPorCategoria(categoria);
    }

    res.json({ sucesso: true, dados });
  });

  obterPorId = async (req, res) => this.run(res, async () => {
    const dados = await this.model.buscarPorId(req.params.id);
    if (!dados) {
      throw new Error('Produto não encontrado');
    }

    res.json({ sucesso: true, dados });
  });

  criar = async (req, res) => this.run(res, async () => {
    const id = await this.model.inserir({
      ...req.body,
      preco: parseNumber(req.body.preco),
      estoque: parseNumber(req.body.estoque)
    });

    res.status(201).json({ sucesso: true, mensagem: 'Produto criado com sucesso', id });
  });

  atualizar = async (req, res) => this.run(res, async () => {
    const dados = await this.model.atualizar(req.params.id, {
      ...req.body,
      preco: parseNumber(req.body.preco),
      estoque: parseNumber(req.body.estoque)
    });

    res.json({ sucesso: true, mensagem: 'Produto atualizado com sucesso', dados });
  });

  remover = async (req, res) => this.run(res, async () => {
    await this.model.deletar(req.params.id);
    res.json({ sucesso: true, mensagem: 'Produto removido com sucesso' });
  });
}

module.exports = ProdutoController;