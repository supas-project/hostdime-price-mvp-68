const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'https://*.app.github.dev'],
  credentials: true
}));
app.use(express.json());

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Para conexões remotas SSL
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota de status/health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint GET para obter todos os preços
app.get('/api/prices', async (req, res) => {
  try {
    console.log('🔍 Buscando dados de preços...');
    
    const result = await pool.query('SELECT * FROM price_table ORDER BY category, name');
    
    console.log(`✅ Encontrados ${result.rows.length} itens de preços`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar preços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Endpoint GET para obter preços por categoria
app.get('/api/prices/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log(`🔍 Buscando preços da categoria: ${category}`);
    
    const result = await pool.query(
      'SELECT * FROM price_table WHERE category = $1 ORDER BY name',
      [category]
    );
    
    console.log(`✅ Encontrados ${result.rows.length} itens na categoria ${category}`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      category
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar preços da categoria ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Endpoint POST para login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    console.log(`🔐 Tentativa de login para: ${email}`);

    // Buscar usuário na base de dados
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    const user = userResult.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log(`❌ Senha inválida para: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin || false
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login bem-sucedido para: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin || false
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Endpoint POST para criar/atualizar preços (protegido)
app.post('/api/prices', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: permissões de administrador requeridas'
      });
    }

    const { category, name, price, description, specifications } = req.body;

    if (!category || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Categoria, nome e preço são obrigatórios'
      });
    }

    const result = await pool.query(
      `INSERT INTO price_table (category, name, price, description, specifications, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (category, name) 
       DO UPDATE SET 
         price = EXCLUDED.price,
         description = EXCLUDED.description,
         specifications = EXCLUDED.specifications,
         updated_at = NOW()
       RETURNING *`,
      [category, name, price, description, specifications]
    );

    console.log(`✅ Preço criado/atualizado: ${category} - ${name}`);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Preço criado/atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar/atualizar preço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Endpoint para criar usuário admin padrão (apenas para setup inicial)
app.post('/api/setup/admin', async (req, res) => {
  try {
    const adminEmail = 'admin@hostdime.com.br';
    const adminPassword = 'H0stD1m3@2025';
    
    // Verificar se admin já existe
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Usuário admin já existe'
      });
    }

    // Criar tabela users se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Inserir admin
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, is_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, is_admin`,
      [adminEmail, passwordHash, 'Administrador', true]
    );

    console.log('✅ Usuário admin criado com sucesso');

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Usuário admin criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
});

// Tratamento de erros de processo
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
