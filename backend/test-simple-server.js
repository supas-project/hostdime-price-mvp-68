const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// CORS muito permissivo para teste
app.use(cors());
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Endpoint de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint de login simples
app.post('/api/auth/login', (req, res) => {
  console.log('Login recebido:', req.body);
  const { email, password } = req.body;
  
  if (email === 'admin@hostdime.com' && password === 'admin123') {
    res.json({
      success: true,
      user: { id: 1, email: 'admin@hostdime.com', role: 'admin' },
      token: 'fake-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor teste rodando na porta ${PORT}`);
});
