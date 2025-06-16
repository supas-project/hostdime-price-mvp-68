const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  console.log('🔐 Testando sistema de login completo...');
  
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
  });
  
  try {
    // 1. Verificar se admin existe
    console.log('1️⃣ Verificando usuário admin...');
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@hostdime.com']);
    
    if (userResult.rows.length === 0) {
      console.log('👤 Criando usuário admin...');
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      await pool.query(`
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES ($1, $2, $3, $4, true)
      `, ['admin@hostdime.com', passwordHash, 'Administrador', 'admin']);
      
      userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@hostdime.com']);
    }
    
    const user = userResult.rows[0];
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      active: user.is_active
    });
    
    // 2. Testar verificação de senha
    console.log('2️⃣ Testando verificação de senha...');
    const isPasswordValid = await bcrypt.compare('admin123', user.password_hash);
    console.log('🔑 Senha válida:', isPasswordValid);
    
    // 3. Testar geração de JWT
    console.log('3️⃣ Testando geração de JWT...');
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    }, jwtSecret, { expiresIn: '24h' });
    
    console.log('🎫 Token gerado:', token.substring(0, 50) + '...');
    
    // 4. Testar decodificação do token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token decodificado:', decoded);
    
    // 5. Simular resposta de login
    const loginResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    };
    
    console.log('📤 Resposta de login simulada:', JSON.stringify(loginResponse, null, 2));
    
    await pool.end();
    console.log('🎉 Teste de login concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste de login:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

testLogin();
