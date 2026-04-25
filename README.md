# E-commerce Backend - Projeto EC48B

Biblioteca de acesso a banco de dados MongoDB em Node.js puro para gerenciar um e-commerce.

## Estrutura do Projeto
```
ecommerce-backend/
├── src/
│   ├── classes/
│   │   ├── Produto.js      # Classe de gerenciamento de produtos
│   │   ├── Usuario.js      # Classe de gerenciamento de usuários
│   │   └── Pedido.js       # Classe de gerenciamento de pedidos
│   ├── database/
│   │   └── connection.js   # Gerenciador de conexão MongoDB
│   ├── utils/
│   │   ├── logger.js       # Sistema de logging
│   │   └── validator.js    # Validação de dados
│   └── index.js            # Arquivo principal
├── tests/
│   └── test.js             # Exemplos de uso
├── logs/                   # Armazenamento dos arquivos de log
├── package.json            # Dependências do projeto
└── README.md              # Documentação básica do projeto (Este arquivo)
```

## Funcionalidades
### 3 Coleções MongoDB Implementadas

1. **Produtos** - Armazenamento e busca de produtos
   - Inserir, buscar, atualizar e deletar produtos
   - Buscar por nome ou categoria
   - Controle de estoque

2. **Usuários** - Dados dos clientes
   - Inserir, buscar, atualizar e deletar usuários
   - Buscar por email ou nome
   - Validação de email único

3. **Pedidos** - Gerenciamento de pedidos
   - Criar pedidos com múltiplos itens
   - Atualizar status do pedido
   - Buscar por usuário ou status

### Recursos

- **Validação de Dados**: Verificação de campos obrigatórios e validação de tipos
- **Tratamento de Erros**: Exceções capturadas e registradas
- **Sistema de Logging**: Registro de operações em arquivos de log
- **Node.js Puro**: Sem frameworks, apenas MongoDB driver

## Instalação

### Pré-requisitos
- Node.js 14+ instalado
- MongoDB rodando localmente em `mongodb://localhost:27017`

### Passos

1. Instale as dependências:
```bash
npm install
```

2. Certifique-se de que o MongoDB está rodando

## Uso

### Inicializar a Aplicação

```javascript
const EcommerceApp = require('./src/index');

const app = new EcommerceApp();
await app.inicializar();

// Acessar as classes
const produto = app.getProduto();
const usuario = app.getUsuario();
const pedido = app.getPedido();
```

## Executar Testes

```bash
npm test
```

## Sistema de Logging

Os logs são armazenados em arquivos na pasta `logs/`:

- **logs/general.log** - Todas as operações
- **logs/errors.log** - Apenas erros e exceções

Exemplo de entrada de log:
```
[2025-04-25T10:30:45.123Z] Produto inserido: 6626e9c5a1b2c3d4e5f6g7h8
[2025-04-25T10:30:46.456Z] ERRO: Email já cadastrado: joao@example.com
```

## Validações Implementadas

### Classe Produto
- Nome e descrição obrigatórios e com tamanho mínimo
- Preço deve ser positivo
- Estoque deve ser positivo

### Classe Usuario
- Nome obrigatório com mínimo 3 caracteres
- Email válido e único
- Telefone obrigatório com mínimo 8 caracteres

### Classe Pedido
- Usuário e itens obrigatórios
- Lista de itens não pode estar vazia
- IDs de usuário e produto devem ser válidos
- Quantidade e preço devem ser positivos
- Status pré-definidos: pendente, processando, enviado, entregue, cancelado

## Tratamento de Erros

Todas as operações capturam erros e registram em logs. Exemplos:

```javascript
try {
  await produto.inserir({ nome: 'Test' }); // Falta descrição, preco, estoque
} catch (error) {
  console.error(error.message); 
  // "Campos obrigatórios faltando: descricao, preco, estoque"
  // Log também é registrado em logs/errors.log
}
```

## Configurações Padrão

- **URL MongoDB**: `mongodb://localhost:27017`
- **Nome do banco**: `ecommerce`
- **Diretório de logs**: `logs/`