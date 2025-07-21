const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS atualizado para Lovable
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://cf50e29d-f282-41f2-aba7-9ca182ac913e.lovableproject.com',
    /.*\.lovable\.app$/,
    /.*\.lovableproject\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'HostDime API funcionando!'
  });
});

// Mock de categorias para teste
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'cpu', display_name: 'CPU', description: 'Processadores' },
      { id: 2, name: 'memoria', display_name: 'Memória', description: 'RAM' },
      { id: 3, name: 'armazenamento', display_name: 'Armazenamento', description: 'SSDs e HDDs' }
    ]
  });
});

// Mock de itens por categoria
app.get('/api/categories/:categoryId/items', (req, res) => {
  const { categoryId } = req.params;
  
  const mockItems = {
    '1': [
      { id: 1, name: 'Intel i7-12700K', price: 2500.00, description: 'Processador Intel' },
      { id: 2, name: 'AMD Ryzen 7 5800X', price: 2200.00, description: 'Processador AMD' }
    ],
    '2': [
      { id: 3, name: '32GB DDR4', price: 800.00, description: 'Memória RAM 32GB' },
      { id: 4, name: '64GB DDR4', price: 1500.00, description: 'Memória RAM 64GB' }
    ],
    '3': [
      { id: 5, name: 'SSD 1TB NVMe', price: 600.00, description: 'SSD alta performance' },
      { id: 6, name: 'SSD 2TB NVMe', price: 1200.00, description: 'SSD grande capacidade' }
    ]
  };

  res.json({
    success: true,
    data: mockItems[categoryId] || []
  });
});

// Login mock
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@hostdime.com.br' && password === 'H0stD1m3@2025') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'admin@hostdime.com.br',
        name: 'Administrador',
        isAdmin: true
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }
});

// Middleware 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 HostDime API Mock rodando na porta ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  console.log(`✅ CORS configurado para Lovable`);
});

module.exports = app;