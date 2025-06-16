const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Iniciando servidor de debug...');

const app = express();
app.use(cors());
app.use(express.json());

// Teste básico
app.get('/api/health', (req, res) => {
  console.log('📍 Health check solicitado');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Teste de conexão PostgreSQL
app.get('/api/test-db', async (req, res) => {
  console.log('🔍 Testando conexão com banco...');
  try {
    // Tentar conexão PostgreSQL
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: process.env.POSTGRES_PORT,
    });
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ PostgreSQL conectado');
    res.json({ 
      success: true, 
      database: 'PostgreSQL',
      current_time: result.rows[0].current_time 
    });
    
    await pool.end();
  } catch (error) {
    console.log('❌ Erro PostgreSQL:', error.message);
    res.json({ 
      success: false, 
      error: error.message,
      database: 'PostgreSQL Error'
    });
  }
});

// Teste de categorias básico
app.get('/api/categories', (req, res) => {
  console.log('📂 Categorias solicitadas');
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Processador', slug: 'cpu' },
      { id: 2, name: 'Memória', slug: 'memory' },
      { id: 3, name: 'Armazenamento', slug: 'storage' }
    ]
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Servidor debug rodando na porta ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`📂 Categories: http://localhost:${PORT}/api/categories`);
});
