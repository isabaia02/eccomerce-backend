# E-commerce Backend - Projeto EC48B

API de e-commerce em Node.js com Express, MongoDB e sessões para autenticação de usuários, organizada em MVC.

## Estrutura do Projeto
```
ecommerce-backend/
├── src/
│   ├── app.js            # Configuração do Express e middlewares
│   ├── controllers/      # Regras de entrada HTTP
│   ├── models/
│   │   ├── Produto.js      # Classe de gerenciamento de produtos
│   │   ├── Usuario.js      # Classe de gerenciamento de usuários
│   │   └── Pedido.js       # Classe de gerenciamento de pedidos
│   ├── database/
│   │   └── connection.js   # Gerenciador de conexão MongoDB
│   ├── middlewares/      # Autenticação e validações de request
│   ├── routes/           # Rotas da API por recurso
│   ├── utils/
│   │   ├── logger.js       # Sistema de logging
│   │   └── validator.js    # Validação de dados
│   ├── index.js            # Camada de domínio e acesso aos modelos
│   └── server.js           # Bootstrap do servidor HTTP
├── tests/
│   └── test.js             # Exemplos de uso
├── logs/                   # Armazenamento dos arquivos de log
├── package.json            # Dependências do projeto
└── README.md              # Documentação básica do projeto (Este arquivo)
```

## Funcionalidades
### MVC Aplicado

- **Models**: as classes em `src/classes` continuam concentrando a regra de domínio e o acesso ao MongoDB.
- **Controllers**: `src/controllers` recebe a requisição, chama o model e devolve JSON.
- **Routes**: `src/routes` organiza os endpoints por recurso.
- **Middlewares**: `src/middlewares` concentra autenticação e regras de acesso.

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
- **API REST com Express**: Rotas JSON para produtos, usuários e pedidos
- **Sessões**: Login com `express-session` para proteger rotas autenticadas
- **Controle de Estoque**: Validação antes de criar pedido e baixa automática ao finalizar

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

## API Express

Execute a aplicação com:

```bash
npm start
```

Rotas principais:

- `POST /api/login` - autentica o usuário e cria a sessão
- `POST /api/logout` - encerra a sessão
- `GET /api/sessao` - mostra o estado atual da sessão
- `GET /api/produtos` e `POST /api/produtos`
- `GET /api/usuarios` e `POST /api/usuarios`
- `GET /api/pedidos` e `POST /api/pedidos`
- `POST /api/pedidos/:id/finalizar` - finaliza o pedido e baixa o estoque

Exemplo de login:

```bash
curl -X POST http://localhost:3000/api/login \
   -H "Content-Type: application/json" \
   -d '{"email":"maria@example.com","senha":"123456"}'
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
- Senha opcional na camada da classe; quando informada, é armazenada com hash e validada no login

### Classe Pedido
- Usuário e itens obrigatórios
- Lista de itens não pode estar vazia
- IDs de usuário e produto devem ser válidos
- Quantidade e preço devem ser positivos
- Estoque é validado antes de criar o pedido
- Status pré-definidos: pendente, processando, finalizado, enviado, entregue, cancelado
- Ao finalizar o pedido, o estoque dos produtos é atualizado automaticamente

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

## Observação sobre login

Para usar a API com autenticação, cadastre usuários informando o campo `senha` no `POST /api/usuarios`. A autenticação aceita usuários antigos com senha em texto puro e migra automaticamente para hash no primeiro login; usuários sem senha continuam válidos apenas para os exemplos legados sem autenticação.