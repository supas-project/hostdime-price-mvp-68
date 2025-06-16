const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testAndInitialize() {
  console.log('🔍 Testando e inicializando sistema completo...');
  
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
  });
  
  try {
    // 1. Testar conexão
    console.log('📡 Testando conexão com PostgreSQL...');
    await pool.query('SELECT 1');
    console.log('✅ Conexão OK');
    
    // 2. Verificar tabelas existentes
    console.log('📊 Verificando tabelas...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = tables.rows.map(r => r.table_name);
    console.log('📋 Tabelas encontradas:', tableNames);
    
    // 3. Executar SQL de inicialização se necessário
    if (!tableNames.includes('users') || !tableNames.includes('categories')) {
      console.log('🔧 Executando SQL de inicialização...');
      const sqlPath = path.join(__dirname, 'database', 'init.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Tabelas criadas');
    }
    
    // 4. Verificar dados
    console.log('📂 Verificando categorias...');
    const categories = await pool.query('SELECT * FROM categories LIMIT 5');
    console.log('📊 Categorias encontradas:', categories.rows.length);
    
    console.log('👤 Verificando usuários...');
    const users = await pool.query('SELECT email, role FROM users');
    console.log('👥 Usuários encontrados:', users.rows);
    
    // 5. Criar admin se não existir
    if (users.rows.length === 0) {
      console.log('👤 Criando usuário admin...');
      const bcrypt = require('bcryptjs');
      const adminEmail = 'admin@hostdime.com';
      const adminPassword = 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      await pool.query(`
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES ($1, $2, $3, 'admin', true)
      `, [adminEmail, passwordHash, 'Administrador']);
      
      console.log('✅ Admin criado:', adminEmail);
    }
    
    // 6. Testar consulta de categorias
    console.log('🔍 Testando consulta de categorias...');
    const testCategories = await pool.query(`
      SELECT id, name, display_name, description, sort_order
      FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, display_name ASC
    `);
    
    console.log('📊 Resultado da consulta:', testCategories.rows);
    
    console.log('🎉 Inicialização completa!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testAndInitialize();
