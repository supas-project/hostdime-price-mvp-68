const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockData = [
  { id: 1, category: 'CPU', name: 'Intel Xeon E5-2620v3', price: 450, description: 'Processador para cargas moderadas' },
  { id: 2, category: 'CPU', name: 'Intel Xeon Silver 4210', price: 730, description: 'Excelente para aplicações empresariais' },
  { id: 3, category: 'Memory', name: '64GB RAM DDR4', price: 480, description: 'Memória RAM DDR4 ECC' },
  { id: 4, category: 'Storage', name: 'SSD NVMe 1TB', price: 350, description: 'Armazenamento rápido NVMe' },
  { id: 5, category: 'Network', name: 'Porta Gigabit', price: 50, description: 'Porta de rede Gigabit' }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/prices', (req, res) => {
  console.log('📊 Serving prices data...');
  res.json({
    success: true,
    data: mockData,
    count: mockData.length
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  // Mock login - aceita admin@hostdime.com.br / H0stD1m3@2025
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

app.listen(PORT, () => {
  console.log(`🚀 Backend simples rodando na porta ${PORT}`);
  console.log(`📊 Dados mock: ${mockData.length} itens`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

console.log('✅ Servidor configurado, iniciando...');
