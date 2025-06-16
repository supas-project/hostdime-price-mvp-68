# HostDime Price MVP - Nova Arquitetura

## 🚀 **Arquitetura Renovada**

Este projeto foi completamente refatorado para usar uma arquitetura moderna e desacoplada:

### Backend (Node.js + Express)
- **API REST** simples e eficiente
- **Dados mockados** para desenvolvimento rápido  
- **Autenticação JWT** implementada
- **CORS configurado** para desenvolvimento

### Frontend (React + Vite + Zustand)
- **Zustand** para gerenciamento de estado centralizado
- **Componentes "dumb"** que apenas consomem o store
- **Proxy configurado** para API calls
- **TypeScript** sem erros

## 🏃‍♂️ **Como Executar**

### 1. Backend (Terminal 1)
```bash
cd backend
npm start
```
Servidor rodará em: http://localhost:3001

### 2. Frontend (Terminal 2)
```bash
npm run dev
```
Aplicação rodará em: http://localhost:8080

## 🔐 **Credenciais de Teste**

- **Email:** admin@hostdime.com.br
- **Senha:** H0stD1m3@2025

## 📊 **Endpoints da API**

- `GET /api/health` - Status do servidor
- `GET /api/prices` - Lista todos os preços
- `POST /api/login` - Autenticação

## 🏗️ **Estrutura do Projeto**

```
├── backend/
│   ├── simple-server.js    # Servidor Express simplificado
│   ├── package.json        # Dependências do backend
│   └── .env                # Variáveis de ambiente
├── src/
│   ├── store/
│   │   └── appStore.ts     # Store central Zustand
│   ├── pages/
│   │   ├── LoginPage.tsx   # Página de login refatorada
│   │   └── PriceTable.tsx  # Tabela de preços refatorada
│   └── App.tsx             # App principal sem QueryClient
└── vite.config.ts          # Configuração com proxy da API
```

## ✅ **Bugs Corrigidos**

1. **❌ Sincronização de dados** → **✅ Store centralizado Zustand**
2. **❌ Dependências conflitantes** → **✅ Arquitetura limpa e simples**
3. **❌ Estados duplicados** → **✅ Single source of truth**
4. **❌ Problemas de autenticação** → **✅ JWT via API REST**

## 🔄 **Fluxo de Dados**

```
Frontend (Zustand Store) → Vite Proxy → Backend API → Dados
```

## 🚀 **Produção**

Para preparar para produção:

1. Configurar banco de dados real no backend
2. Configurar variáveis de ambiente de produção  
3. Build do frontend: `npm run build`
4. Deploy do backend e frontend separadamente

## 📝 **Próximos Passos**

- [ ] Integrar banco PostgreSQL real
- [ ] Implementar CRUD completo para preços
- [ ] Adicionar validações de dados
- [ ] Implementar testes automatizados
- [ ] Configurar CI/CD
