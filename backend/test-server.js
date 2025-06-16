const express = require('express');
require('dotenv').config();

console.log('🚀 Starting test server');
console.log('Environment:', process.env.NODE_ENV);
console.log('DB Host:', process.env.POSTGRES_HOST);

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📦 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

setTimeout(() => {
  console.log('🔄 Test server running normally');
}, 2000);
