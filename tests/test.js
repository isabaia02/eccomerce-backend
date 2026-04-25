const EcommerceApp = require('../src/index');

async function executarTestes() {
  const app = new EcommerceApp();
  
  try {
    console.log('\nTestes da Biblioteca E-commerce\n');
    
    await app.inicializar();
    
    const produto = app.getProduto();
    const usuario = app.getUsuario();
    const pedido = app.getPedido();

    console.log('Teste 1: Inserindo Produtos');
    const produtoId1 = await produto.inserir({
      nome: 'Notebook Dell XPS',
      descricao: 'Notebook de alta performance',
      preco: 5500.00,
      estoque: 10,
      categoria: 'Eletrônicos'
    });
    console.log(`Produto 1 criado: ${produtoId1}`);

    const produtoId2 = await produto.inserir({
      nome: 'Mouse Logitech',
      descricao: 'Mouse sem fio',
      preco: 150.00,
      estoque: 50,
      categoria: 'Periféricos'
    });
    console.log(`Produto 2 criado: ${produtoId2}\n`);

    console.log('Teste 2: Buscando Produtos');
    const produtoBuscado = await produto.buscarPorId(produtoId1.toString());
    console.log(`Produto encontrado: ${produtoBuscado.nome}\n`);

    console.log('Teste 3: Buscando por Nome');
    const produtosPorNome = await produto.buscarPorNome('Mouse');
    console.log(`Produtos encontrados: ${produtosPorNome.length}\n`);

    console.log('Teste 4: Inserindo Usuários');
    const usuarioId = await usuario.inserir({
      nome: 'Isadora Costa',
      email: 'isadora@example.com',
      telefone: '11999999999',
      endereco: 'Rua A, 123'
    });
    console.log(`Usuário criado: ${usuarioId}\n`);

    console.log('Teste 5: Buscando Usuário');
    const usuarioBuscado = await usuario.buscarPorEmail('isadora@example.com');
    console.log(`Usuário encontrado: ${usuarioBuscado.nome}\n`);

    console.log('Teste 6: Inserindo Pedido');
    const pedidoId = await pedido.inserir({
      usuarioId: usuarioId.toString(),
      itens: [
        {
          produtoId: produtoId1.toString(),
          quantidade: 1,
          preco: 5500.00
        },
        {
          produtoId: produtoId2.toString(),
          quantidade: 2,
          preco: 150.00
        }
      ],
      endereco: 'Rua A, 123'
    });
    console.log(`Pedido criado: ${pedidoId}\n`);

    console.log('Teste 7: Buscando Pedido');
    const pedidoBuscado = await pedido.buscarPorId(pedidoId.toString());
    console.log(`Pedido encontrado - Total: R$ ${pedidoBuscado.totalPedido}\n`);

    console.log('Teste 8: Atualizando Status do Pedido');
    const pedidoAtualizado = await pedido.atualizarStatus(pedidoId.toString(), 'processando');
    console.log(`Status atualizado para: ${pedidoAtualizado.status}\n`);

    console.log('Teste 9: Atualizando Produto');
    const produtoAtualizado = await produto.atualizar(produtoId1.toString(), {
      preco: 5200.00,
      estoque: 8
    });
    console.log(`Produto atualizado - Novo preço: R$ ${produtoAtualizado.preco}\n`);

    console.log('Teste 10: Listando Todos os Registros');
    const todosProdutos = await produto.listarTodos();
    const todosUsuarios = await usuario.listarTodos();
    const todosPedidos = await pedido.listarTodos();
    
    console.log(`Total de Produtos: ${todosProdutos.length}`);
    console.log(`Total de Usuários: ${todosUsuarios.length}`);
    console.log(`Total de Pedidos: ${todosPedidos.length}\n`);

    console.log('Todos os testes executados com sucesso!\n');

  } catch (error) {
    console.error('Erro durante testes:', error.message);
  } finally {
    await app.encerrar();
  }
}

executarTestes();
