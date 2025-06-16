const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Tentar importar dependências opcionais
let helmet, rateLimit;
try {
  helmet = require('helmet');
  rateLimit = require('express-rate-limit');
} catch (err) {
  console.log('⚠️ Security packages not installed, using basic security');
}

// Importar serviços
const authService = require('./services/authService');
const priceService = require('./services/priceService');

// Tentar conexão PostgreSQL primeiro, fallback para SQLite
let dbConnection;
try {
  dbConnection = require('./database/connection');
} catch (err) {
  console.log('⚠️ PostgreSQL not available, using SQLite fallback');
  const SQLiteConnection = require('./database/sqlite');
  dbConnection = new SQLiteConnection();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Segurança básica
if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
}

// Rate limiting se disponível
if (rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      success: false,
      error: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
  });
  app.use(limiter);
}

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ============ ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbConnection.constructor.name === 'SQLiteConnection' ? 'SQLite' : 'PostgreSQL',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    const result = await authService.login(email, password);

    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar todos os itens de preço
app.get('/api/prices', async (req, res) => {
  try {
    const items = await priceService.getAllPriceItems();
    
    res.json({
      success: true,
      data: items,
      count: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching prices:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar preços'
    });
  }
});

// Buscar categorias
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await priceService.getCategories();
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar categorias'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.path,
    method: req.method
  });
});

// Error handler global
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// ============ SERVER STARTUP ============

const startServer = async () => {
  try {
    console.log('🚀 Starting HostDime Price MVP Server (Hybrid)...');
    
    // Configurar conexão do banco
    if (dbConnection.constructor.name === 'SQLiteConnection') {
      console.log('📊 Using SQLite database...');
      await dbConnection.connect();
      await dbConnection.initializeDatabase();
    } else {
      console.log('📊 Testing PostgreSQL connection...');
      const connected = await dbConnection.testConnection();
      if (!connected) {
        throw new Error('PostgreSQL connection failed');
      }
      await dbConnection.initializeDatabase();
    }

    // Criar admin inicial
    console.log('👤 Creating initial admin user...');
    await authService.createInitialAdmin();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🎉 HostDime Price MVP Server is ready!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Fallback para SQLite se PostgreSQL falhar
    if (dbConnection.constructor.name !== 'SQLiteConnection') {
      console.log('🔄 Falling back to SQLite...');
      const SQLiteConnection = require('./database/sqlite');
      dbConnection = new SQLiteConnection();
      
      try {
        await dbConnection.connect();
        await dbConnection.initializeDatabase();
        await authService.createInitialAdmin();
        
        app.listen(PORT, () => {
          console.log(`✅ Server running on port ${PORT} with SQLite`);
          console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
          console.log('🎉 HostDime Price MVP Server is ready!');
        });
      } catch (sqliteError) {
        console.error('❌ SQLite fallback also failed:', sqliteError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  if (dbConnection.close) await dbConnection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  if (dbConnection.close) await dbConnection.close();
  process.exit(0);
});

// Iniciar servidor
startServer();
