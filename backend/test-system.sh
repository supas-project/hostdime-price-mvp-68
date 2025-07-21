#!/bin/bash

echo "🚀 HostDime - Sistema de Diagnóstico e Correção"
echo "=============================================="

# 1. Verificar se o backend está rodando
echo "1. Verificando Backend..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend está rodando"
else
    echo "❌ Backend NÃO está rodando"
    echo "🔧 Iniciando backend..."
    cd backend
    if [ -f "package.json" ]; then
        npm install
        npm run start &
        echo "⏳ Aguardando backend inicializar..."
        sleep 5
    else
        echo "❌ Diretório backend não encontrado"
    fi
fi

# 2. Testar conectividade
echo "2. Testando conectividade..."
for i in {1..5}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Conectividade OK"
        break
    else
        echo "⏳ Tentativa $i/5..."
        sleep 2
    fi
done

# 3. Testar endpoints críticos
echo "3. Testando endpoints..."
echo "- Health: $(curl -s http://localhost:3001/api/health | jq -r '.status' 2>/dev/null || echo 'FALHA')"
echo "- Categories: $(curl -s http://localhost:3001/api/categories | jq -r '.success' 2>/dev/null || echo 'FALHA')"

echo "✅ Diagnóstico concluído!"