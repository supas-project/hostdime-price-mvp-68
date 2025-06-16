#!/bin/bash

echo "🧪 Testando API do Backend..."

echo "1. Teste de Health:"
curl -s http://localhost:3001/api/health | jq '.' || echo "Erro no health"

echo -e "\n2. Teste de Categories:"
curl -s http://localhost:3001/api/categories | jq '.' || echo "Erro nas categorias"

echo -e "\n3. Teste de Login:"
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hostdime.com", "password": "admin123"}' | jq '.' || echo "Erro no login"

echo -e "\n4. Teste de Login de teste:"
curl -s -X POST http://localhost:3001/api/test/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hostdime.com", "password": "admin123"}' | jq '.' || echo "Erro no login de teste"

echo -e "\n✅ Testes concluídos!"
