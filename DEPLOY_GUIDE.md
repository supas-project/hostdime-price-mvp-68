# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO - HOSTDIME PRICE MVP

## 📋 CHECKLIST PRÉ-DEPLOY

### 1. **Configurações de Ambiente**

#### Backend (.env de produção):
```env
# Database Configuration
POSTGRES_HOST=seu-servidor-postgres.com
POSTGRES_USER=seu_usuario_prod
POSTGRES_PASSWORD=senha_super_segura
POSTGRES_DATABASE=hostdime_price_prod
POSTGRES_PORT=5432

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Configuration
JWT_SECRET=chave_jwt_super_segura_produção_2025
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://seu-dominio.com,https://www.seu-dominio.com

# SSL/HTTPS
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
```

#### Frontend (build de produção):
```bash
# Variáveis de ambiente para build
VITE_API_URL=https://api.seu-dominio.com
VITE_APP_ENV=production
```

### 2. **Scripts de Deploy**

#### Build do Frontend:
```bash
npm run build
# Gera pasta dist/ para servir estaticamente
```

#### Configuração do Servidor Web (Nginx):
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Frontend (arquivos estáticos)
    location / {
        root /var/www/hostdime-price/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. **Segurança de Produção**

#### Firewall:
```bash
# Permitir apenas portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 5432  # PostgreSQL (apenas internamente)
```

#### PM2 para Node.js:
```bash
# Instalar PM2
npm install -g pm2

# Configurar aplicação
pm2 start backend/hybrid-server-v2.js --name "hostdime-api"
pm2 startup
pm2 save
```

### 4. **Banco de Dados de Produção**

#### PostgreSQL:
```sql
-- Criar usuário e banco específicos
CREATE USER hostdime_prod WITH PASSWORD 'senha_super_segura';
CREATE DATABASE hostdime_price_prod OWNER hostdime_prod;
GRANT ALL PRIVILEGES ON DATABASE hostdime_price_prod TO hostdime_prod;
```

#### Backup automático:
```bash
#!/bin/bash
# Script de backup diário
pg_dump -h localhost -U hostdime_prod hostdime_price_prod > /backups/hostdime_$(date +%Y%m%d).sql
```

### 5. **Monitoramento**

#### Logs:
```bash
# Logs do PM2
pm2 logs hostdime-api

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### Health Check:
```bash
# Script de monitoramento
curl -f https://seu-dominio.com/api/health || echo "API down!"
```

## 🧪 TESTES EM PRODUÇÃO

### 1. **Testes Pré-Deploy (Local)**
- ✅ Build de produção funciona
- ✅ Variáveis de ambiente corretas
- ✅ Conexão com banco de produção
- ✅ SSL/HTTPS configurado

### 2. **Testes Pós-Deploy (Servidor)**
```bash
# Health check
curl https://seu-dominio.com/api/health

# Teste de login
curl -X POST https://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hostdime.com","password":"sua_senha"}'

# Teste de categorias
curl https://seu-dominio.com/api/categories
```

### 3. **Ferramentas de Teste de Produção**
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: GTmetrix, Google PageSpeed
- **Security**: SSL Labs, Security Headers
- **Load Testing**: Apache Bench, k6

## 📦 DIFERENÇAS DO AMBIENTE LOCAL

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **URLs** | localhost:8082, localhost:3001 | https://seu-dominio.com |
| **Banco** | PostgreSQL local/SQLite | PostgreSQL dedicado |
| **SSL** | HTTP | HTTPS obrigatório |
| **CORS** | Permissivo | Restrito ao domínio |
| **Logs** | Console | Arquivos + Monitoramento |
| **Process** | Node direto | PM2/Docker |
| **Backup** | Manual | Automatizado |

## 🚨 PRÓXIMOS PASSOS

1. **Finalizar testes locais** (atual)
2. **Preparar servidor de produção**
3. **Configurar domínio e SSL**
4. **Deploy e testes finais**
5. **Monitoramento e manutenção**
