const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar serviços e middleware
const { testConnection, initializeDatabase } = require('./database/connection');
const authService = require('./services/authService');
const priceService = require('./services/priceService');
const { authenticateToken, requireAdmin, optionalAuth, rateLimit: customRateLimit } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP por janela
  message: {
    success: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use(limiter);

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }
});

// CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://cf50e29d-f282-41f2-aba7-9ca182ac913e.lovableproject.com',
    /.*\.lovable\.app$/,
    /.*\.lovableproject\.com$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check
app.get('/api/health/database', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      status: isConnected ? 'OK' : 'ERROR',
      database: isConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ AUTH ROUTES ============

// Login
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
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

// Verificar token (para validar se ainda está logado)
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (invalidar token no frontend - sem persistência de sessão por simplicidade)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Em uma implementação completa, invalidaríamos o token no servidor
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ============ PRICE ROUTES ============

// Buscar todos os itens de preço
app.get('/api/prices', optionalAuth, async (req, res) => {
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
app.get('/api/categories', optionalAuth, async (req, res) => {
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

// Buscar itens por categoria
app.get('/api/categories/:categoryId/items', optionalAuth, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await priceService.getItemsByCategory(categoryId);
    
    res.json({
      success: true,
      data: items,
      count: items.length,
      category: categoryId
    });
  } catch (error) {
    console.error('❌ Error fetching items by category:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar itens da categoria'
    });
  }
});

// Buscar item específico
app.get('/api/items/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await priceService.getItemById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('❌ Error fetching item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar item'
    });
  }
});

// Estatísticas (apenas para admins)
app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await priceService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});

// ============ ADMIN ROUTES ============

// Criar item (apenas admin)
app.post('/api/admin/items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categoryId, name, description, price, specifications } = req.body;

    if (!categoryId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Categoria, nome e preço são obrigatórios'
      });
    }

    const item = await priceService.createItem(categoryId, name, description, price, specifications);
    
    res.status(201).json({
      success: true,
      data: item,
      message: 'Item criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error creating item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar item'
    });
  }
});

// Atualizar item (apenas admin)
app.put('/api/admin/items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await priceService.updateItem(id, updates);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: item,
      message: 'Item atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error updating item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar item'
    });
  }
});

// Deletar item (apenas admin)
app.delete('/api/admin/items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await priceService.deleteItem(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Item deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error deleting item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar item'
    });
  }
});

// ============ ERROR HANDLERS ============

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
    console.log('🚀 Starting HostDime Price MVP Server...');
    
    // Testar conexão com banco
    console.log('📊 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Database connection failed. Exiting...');
      process.exit(1);
    }

    // Inicializar banco (criar tabelas se não existirem)
    console.log('🏗️ Initializing database...');
    await initializeDatabase();

    // Criar usuário admin inicial
    console.log('👤 Creating initial admin user...');
    await authService.createInitialAdmin();

    // Limpar sessões expiradas
    console.log('🧹 Cleaning expired sessions...');
    await authService.cleanExpiredSessions();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Database health: http://localhost:${PORT}/api/health/database`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🎉 HostDime Price MVP Server is ready!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();
