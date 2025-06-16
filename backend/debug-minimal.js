const express = require('express');
const cors = require('cors');

console.log('🚀 Iniciando servidor mínimo para debug...');

const app = express();
const PORT = 3002;

// CORS mínimo
app.use(cors());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('📦 Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Middleware JSON
app.use(express.json());

// Log após JSON middleware
app.use((req, res, next) => {
  console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Endpoint GET de teste
app.get('/api/test', (req, res) => {
  console.log('✅ GET /api/test chamado');
  res.json({ success: true, message: 'GET funcionando' });
});

// Endpoint POST de teste
app.post('/api/test', (req, res) => {
  console.log('✅ POST /api/test chamado');
  console.log('📨 Dados recebidos:', req.body);
  res.json({ success: true, message: 'POST funcionando', data: req.body });
});

// Endpoint POST de login mínimo
app.post('/api/login', (req, res) => {
  console.log('🔐 POST /api/login chamado');
  const { email, password } = req.body;
  
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password ? '[PRESENTE]' : '[AUSENTE]');
  
  if (email === 'admin@hostdime.com' && password === 'admin123') {
    console.log('✅ Login válido');
    res.json({
      success: true,
      message: 'Login bem-sucedido',
      user: { email, name: 'Admin' },
      token: 'fake-token-123'
    });
  } else {
    console.log('❌ Login inválido');
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❓ Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor debug rodando na porta ${PORT}`);
  console.log(`🌐 Teste GET: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Teste LOGIN: http://localhost:${PORT}/api/login`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📦 Encerrando servidor debug...');
  server.close(() => {
    console.log('✅ Servidor debug encerrado');
    process.exit(0);
  });
});
