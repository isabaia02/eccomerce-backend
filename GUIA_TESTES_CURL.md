# Guia de Testes com `curl`

Este guia serve para testar a API com o MongoDB e o servidor rodando localmente.

## Pré-requisitos

- MongoDB ativo localmente.
- API rodando em `http://localhost:3000`.
- Usuário criado com senha para liberar o login.

## Variáveis úteis

```bash
API_URL=http://localhost:3000/api
COOKIE_JAR=/tmp/ecommerce-cookies.txt
EMAIL=curl.guia@example.com
SENHA=123456
```

## 1. Health check

Objetivo: confirmar que a API está respondendo.

Resultado esperado: HTTP 200 com a mensagem de saúde da API.

```bash
curl -i "$API_URL/health"
```

## 2. Criar usuário

Objetivo: cadastrar um usuário com senha para autenticação.

Resultado esperado: HTTP 201 com `sucesso: true` e o `id` do usuário.

```bash
curl -i -X POST "$API_URL/usuarios" \
  -H 'Content-Type: application/json' \
  -d "{\"nome\":\"Curl Guia\",\"email\":\"$EMAIL\",\"telefone\":\"11999999999\",\"senha\":\"$SENHA\"}"
```

## 3. Login

Objetivo: autenticar o usuário e gravar a sessão no cookie jar.

Resultado esperado: HTTP 200 com `sucesso: true` e dados do usuário na resposta.

```bash
curl -i -c "$COOKIE_JAR" -X POST "$API_URL/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}"
```

## 4. Ver sessão

Objetivo: confirmar que a sessão está ativa após o login.

Resultado esperado: `autenticado: true` e o usuário retornado no JSON.

```bash
curl -i -b "$COOKIE_JAR" "$API_URL/sessao"
```

## 5. Criar produto

Objetivo: cadastrar um produto para usar nos testes de listagem e pedido.

Resultado esperado: HTTP 201 com `sucesso: true` e o `id` do produto.

```bash
curl -i -b "$COOKIE_JAR" -X POST "$API_URL/produtos" \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Mouse Logitech","descricao":"Mouse sem fio","preco":150,"estoque":50,"categoria":"Periféricos"}'
```

## 6. Listar produtos

Objetivo: confirmar que a listagem autenticada está funcionando.

Resultado esperado: HTTP 200 com array de produtos.

```bash
curl -i -b "$COOKIE_JAR" "$API_URL/produtos"
```

## 7. Buscar produto por ID

Objetivo: validar a leitura de um item específico.

Resultado esperado: HTTP 200 com o produto retornado.

```bash
curl -i -b "$COOKIE_JAR" "$API_URL/produtos/<PRODUTO_ID>"
```

## 8. Criar pedido

Objetivo: criar um pedido com usuário autenticado e produto existente.

Resultado esperado: HTTP 201 com `sucesso: true` e o `id` do pedido.

```bash
curl -i -b "$COOKIE_JAR" -X POST "$API_URL/pedidos" \
  -H 'Content-Type: application/json' \
  -d "{\"usuarioId\":\"<USUARIO_ID>\",\"itens\":[{\"produtoId\":\"<PRODUTO_ID>\",\"quantidade\":1,\"preco\":150}],\"endereco\":\"Rua A, 123\",\"observacoes\":\"Teste via curl\"}"
```

## 9. Listar pedidos

Objetivo: confirmar que o pedido foi persistido.

Resultado esperado: HTTP 200 com a lista de pedidos.

```bash
curl -i -b "$COOKIE_JAR" "$API_URL/pedidos"
```

## 10. Buscar pedido por ID

Objetivo: validar a consulta detalhada de um pedido.

Resultado esperado: HTTP 200 com o pedido completo.

```bash
curl -i -b "$COOKIE_JAR" "$API_URL/pedidos/<PEDIDO_ID>"
```

## 11. Resumo do pedido

Objetivo: verificar o endpoint de resumo do pedido.

Resultado esperado: HTTP 200 com quantidade de itens, total e status.

```bash
curl -i -b "$COOKIE_JAR" "$API_URL/pedidos/<PEDIDO_ID>/resumo"
```

## 12. Atualizar status do pedido

Objetivo: alterar o status do pedido para um estado intermediário.

Resultado esperado: HTTP 200 com o pedido atualizado e status `processando`.

```bash
curl -i -b "$COOKIE_JAR" -X PATCH "$API_URL/pedidos/<PEDIDO_ID>/status" \
  -H 'Content-Type: application/json' \
  -d '{"status":"processando"}'
```

## 13. Finalizar pedido

Objetivo: concluir o pedido e aplicar a baixa de estoque.

Resultado esperado: HTTP 200 com o pedido em status `finalizado`.

```bash
curl -i -b "$COOKIE_JAR" -X POST "$API_URL/pedidos/<PEDIDO_ID>/finalizar"
```

## 14. Logout

Objetivo: encerrar a sessão ativa.

Resultado esperado: HTTP 200 com `sucesso: true` e sessão destruída.

```bash
curl -i -b "$COOKIE_JAR" -X POST "$API_URL/logout"
```

## Casos negativos úteis

### Login inválido

Objetivo: validar rejeição de credenciais erradas.

Resultado esperado: HTTP 401 com mensagem `Credenciais inválidas`.

```bash
curl -i -X POST "$API_URL/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"curl.guia@example.com","senha":"senha-errada"}'
```

### Acesso sem sessão

Objetivo: confirmar proteção das rotas autenticadas.

Resultado esperado: HTTP 401 com mensagem `Usuário não autenticado`.

```bash
curl -i "$API_URL/produtos"
```

## Atalho

Se preferir rodar tudo de uma vez, use o script pronto (utilizado para validar o desenvolvimento):

```bash
bash tests/curl-tests.sh
```
