const BaseController = require('./BaseController');

class PedidoController extends BaseController {
  constructor(pedidoModel) {
    super(pedidoModel);
  }

  listar = async (req, res) => this.run(res, async () => {
    const { usuarioId, status } = req.query;

    let dados = await this.model.listarTodos();
    if (usuarioId) {
      dados = await this.model.buscarPorUsuario(usuarioId);
    } else if (status) {
      dados = await this.model.buscarPorStatus(status);
    }

    res.json({ sucesso: true, dados });
  });

  obterPorId = async (req, res) => this.run(res, async () => {
    const dados = await this.model.buscarPorId(req.params.id);
    if (!dados) {
      throw new Error('Pedido não encontrado');
    }

    res.json({ sucesso: true, dados });
  });

  resumo = async (req, res) => this.run(res, async () => {
    const dados = await this.model.obterResumo(req.params.id);
    res.json({ sucesso: true, dados });
  });

  criar = async (req, res) => this.run(res, async () => {
    const pedidoId = await this.model.inserir(req.body);

    if (req.body.finalizar === true) {
      const pedidoFinalizado = await this.model.finalizarPedido(pedidoId.toString());
      res.status(201).json({ sucesso: true, mensagem: 'Pedido criado e finalizado com sucesso', dados: pedidoFinalizado });
      return;
    }

    res.status(201).json({ sucesso: true, mensagem: 'Pedido criado com sucesso', id: pedidoId });
  });

  finalizar = async (req, res) => this.run(res, async () => {
    const dados = await this.model.finalizarPedido(req.params.id);
    res.json({ sucesso: true, mensagem: 'Pedido finalizado com sucesso', dados });
  });

  atualizarStatus = async (req, res) => this.run(res, async () => {
    const { status } = req.body;
    const dados = await this.model.atualizarStatus(req.params.id, status);
    res.json({ sucesso: true, mensagem: 'Status atualizado com sucesso', dados });
  });
}

module.exports = PedidoController;