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
  // CPU
  { id: 1, category: 'CPU', name: 'Intel Xeon E5-2620v3', price: 450, description: 'Processador 6 cores, 12 threads', specifications: ['6 Cores', '12 Threads', '2.4 GHz'] },
  { id: 2, category: 'CPU', name: 'Intel Xeon E5-2680v4', price: 650, description: 'Processador 14 cores, 28 threads', specifications: ['14 Cores', '28 Threads', '2.4 GHz'] },
  { id: 3, category: 'CPU', name: 'AMD EPYC 7302P', price: 800, description: 'Processador 16 cores, 32 threads', specifications: ['16 Cores', '32 Threads', '3.0 GHz'] },
  
  // Memória
  { id: 4, category: 'Memória', name: '32GB RAM DDR4', price: 240, description: 'Memória RAM DDR4 ECC', specifications: ['32GB', 'DDR4', 'ECC'] },
  { id: 5, category: 'Memória', name: '64GB RAM DDR4', price: 480, description: 'Memória RAM DDR4 ECC', specifications: ['64GB', 'DDR4', 'ECC'] },
  { id: 6, category: 'Memória', name: '128GB RAM DDR4', price: 960, description: 'Memória RAM DDR4 ECC', specifications: ['128GB', 'DDR4', 'ECC'] },
  
  // Armazenamento
  { id: 7, category: 'Armazenamento', name: 'SSD 512GB NVMe', price: 150, description: 'SSD NVMe para alta performance', specifications: ['512GB', 'NVMe', '3500 MB/s'] },
  { id: 8, category: 'Armazenamento', name: 'SSD 1TB NVMe', price: 300, description: 'SSD NVMe para alta performance', specifications: ['1TB', 'NVMe', '3500 MB/s'] },
  { id: 9, category: 'Armazenamento', name: 'SSD 2TB NVMe', price: 600, description: 'SSD NVMe para alta performance', specifications: ['2TB', 'NVMe', '3500 MB/s'] },
  { id: 10, category: 'Armazenamento', name: 'HDD 4TB SATA', price: 200, description: 'Hard disk tradicional', specifications: ['4TB', 'SATA', '7200 RPM'] },
  
  // Rede
  { id: 11, category: 'Rede', name: 'Porta 1Gbps', price: 50, description: 'Conexão de rede 1Gbps', specifications: ['1Gbps', 'Ethernet', 'Unlimited'] },
  { id: 12, category: 'Rede', name: 'Porta 10Gbps', price: 200, description: 'Conexão de rede 10Gbps', specifications: ['10Gbps', 'Ethernet', 'Unlimited'] },
  
  // Backup
  { id: 13, category: 'Backup', name: 'Backup 500GB', price: 100, description: 'Backup automático diário', specifications: ['500GB', 'Diário', 'Automático'] },
  { id: 14, category: 'Backup', name: 'Backup 1TB', price: 180, description: 'Backup automático diário', specifications: ['1TB', 'Diário', 'Automático'] },
  
  // Sistema Operacional
  { id: 15, category: 'Sistema Operacional', name: 'Ubuntu Server 22.04', price: 0, description: 'Sistema operacional Linux gratuito', specifications: ['Linux', 'LTS', 'Gratuito'] },
  { id: 16, category: 'Sistema Operacional', name: 'Windows Server 2022', price: 150, description: 'Sistema operacional Windows', specifications: ['Windows', 'Licenciado', 'Suporte'] },
  { id: 17, category: 'Sistema Operacional', name: 'CentOS 9', price: 0, description: 'Sistema operacional Linux gratuito', specifications: ['Linux', 'Enterprise', 'Gratuito'] },
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
