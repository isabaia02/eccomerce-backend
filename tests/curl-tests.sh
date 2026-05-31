#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000/api}"
COOKIE_JAR="${COOKIE_JAR:-$(mktemp -t ecommerce-cookies.XXXXXX)}"

cleanup() {
  rm -f "$COOKIE_JAR"
}
trap cleanup EXIT

req() {
  local title="$1"
  shift

  printf '\n=== %s ===\n' "$title"
  curl -sS -i "$@"
  printf '\n'
}

json_request() {
  curl -sS "$@"
}

json_get() {
  local payload="$1"
  local expression="$2"

  node -e '
const payload = JSON.parse(process.argv[1]);
const parts = process.argv[2].split(".");
let current = payload;

for (const part of parts) {
  if (current == null) {
    process.exit(1);
  }

  current = current[part];
}

if (current === undefined || current === null) {
  process.exit(1);
}

process.stdout.write(String(current));
' "$payload" "$expression"
}

post_json() {
  local url="$1"
  local data="$2"
  shift 2

  curl -sS -i \
    -X POST "$url" \
    -H 'Content-Type: application/json' \
    "$@" \
    -d "$data"
}

put_json() {
  local url="$1"
  local data="$2"
  shift 2

  curl -sS -i \
    -X PUT "$url" \
    -H 'Content-Type: application/json' \
    "$@" \
    -d "$data"
}

patch_json() {
  local url="$1"
  local data="$2"
  shift 2

  curl -sS -i \
    -X PATCH "$url" \
    -H 'Content-Type: application/json' \
    "$@" \
    -d "$data"
}

delete_req() {
  local url="$1"
  shift

  curl -sS -i -X DELETE "$url" "$@"
}

echo "API: $API_URL"
echo "Cookie jar: $COOKIE_JAR"

req "Health check" "$API_URL/health"

USUARIO_EMAIL="${USUARIO_EMAIL:-curl.test@example.com}"
USUARIO_SENHA="${USUARIO_SENHA:-123456}"

USUARIO_RESP="$(json_request \
  -X POST "$API_URL/usuarios" \
  -H 'Content-Type: application/json' \
  -d "{\"nome\":\"Curl Test\",\"email\":\"$USUARIO_EMAIL\",\"telefone\":\"11999999999\",\"senha\":\"$USUARIO_SENHA\"}")"
USUARIO_ID="$(json_get "$USUARIO_RESP" id)"

printf '\n=== Criar usuario ===\n%s\n' "$USUARIO_RESP"

LOGIN_RESP="$(json_request \
  -c "$COOKIE_JAR" \
  -X POST "$API_URL/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$USUARIO_EMAIL\",\"senha\":\"$USUARIO_SENHA\"}")"

printf '\n=== Login ===\n%s\n' "$LOGIN_RESP"

LOGIN_USUARIO_ID="$(json_get "$LOGIN_RESP" usuario.id)"
if [[ "$LOGIN_USUARIO_ID" != "$USUARIO_ID" ]]; then
  echo "Aviso: id do login difere do usuário criado"
fi

req "Sessao atual" \
  -b "$COOKIE_JAR" \
  "$API_URL/sessao"

req "Listar usuarios autenticado" \
  -b "$COOKIE_JAR" \
  "$API_URL/usuarios"

PRODUTO_RESP="$(json_request \
  -b "$COOKIE_JAR" \
  -X POST "$API_URL/produtos" \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Mouse Logitech","descricao":"Mouse sem fio","preco":150,"estoque":50,"categoria":"Periféricos"}')"
PRODUTO_ID="$(json_get "$PRODUTO_RESP" id)"

printf '\n=== Criar produto ===\n%s\n' "$PRODUTO_RESP"

req "Listar produtos" \
  -b "$COOKIE_JAR" \
  "$API_URL/produtos"

req "Buscar usuario por ID" \
  -b "$COOKIE_JAR" \
  "$API_URL/usuarios/$USUARIO_ID"

req "Buscar produto por ID" \
  -b "$COOKIE_JAR" \
  "$API_URL/produtos/$PRODUTO_ID"

PEDIDO_RESP="$(json_request \
  -b "$COOKIE_JAR" \
  -X POST "$API_URL/pedidos" \
  -H 'Content-Type: application/json' \
  -d "{\"usuarioId\":\"$USUARIO_ID\",\"itens\":[{\"produtoId\":\"$PRODUTO_ID\",\"quantidade\":1,\"preco\":150}],\"endereco\":\"Rua A, 123\",\"observacoes\":\"Teste via curl\"}")"
PEDIDO_ID="$(json_get "$PEDIDO_RESP" id)"

printf '\n=== Criar pedido ===\n%s\n' "$PEDIDO_RESP"

req "Listar pedidos" \
  -b "$COOKIE_JAR" \
  "$API_URL/pedidos"

req "Buscar pedido por ID" \
  -b "$COOKIE_JAR" \
  "$API_URL/pedidos/$PEDIDO_ID"

req "Resumo do pedido" \
  -b "$COOKIE_JAR" \
  "$API_URL/pedidos/$PEDIDO_ID/resumo"

req "Atualizar status do pedido" \
  -b "$COOKIE_JAR" \
  -X PATCH "$API_URL/pedidos/$PEDIDO_ID/status" \
  -H 'Content-Type: application/json' \
  -d '{"status":"processando"}'

req "Finalizar pedido" \
  -b "$COOKIE_JAR" \
  -X POST "$API_URL/pedidos/$PEDIDO_ID/finalizar"

req "Logout" \
  -b "$COOKIE_JAR" \
  -X POST "$API_URL/logout"

echo
echo "Fim dos testes."
