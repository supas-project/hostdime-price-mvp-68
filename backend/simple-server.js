const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Dados mockados para teste
const mockPrices = [
  { id: 1, category: 'cpu', name: 'Intel Xeon E5-2620v3', price: 450, description: 'Processador para servidores' },
  { id: 2, category: 'memory', name: '64GB RAM DDR4', price: 480, description: 'Memória RAM de alta performance' },
  { id: 3, category: 'storage', name: 'SSD 1TB NVMe', price: 300, description: 'Armazenamento rápido SSD' },
];

app.get('/api/prices', (req, res) => {
  res.json({
    success: true,
    data: mockPrices,
    count: mockPrices.length
  });
});

// Login mockado
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@hostdime.com.br' && password === 'H0stD1m3@2025') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
});
