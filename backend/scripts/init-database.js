const { testConnection, initializeDatabase, closeConnection } = require('../database/connection');
const authService = require('../services/authService');

const initDatabase = async () => {
  console.log('🏗️ Initializing HostDime Price MVP Database...');
  
  try {
    // Testar conexão
    console.log('📊 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    
    // Inicializar estrutura
    console.log('🔧 Creating database structure...');
    await initializeDatabase();
    
    // Criar admin inicial
    console.log('👤 Creating initial admin user...');
    await authService.createInitialAdmin();
    
    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('🎉 You can now start the server with:');
    console.log('   npm start');
    console.log('');
    console.log('🔐 Admin credentials:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
};

// Executar inicialização
initDatabase();
