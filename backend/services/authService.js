const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database/connection');
require('dotenv').config();

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  }

  // Hash da senha
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.bcryptRounds);
    } catch (error) {
      console.error('❌ Error hashing password:', error);
      throw new Error('Erro ao processar senha');
    }
  }

  // Verificar senha
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      return false;
    }
  }

  // Gerar JWT token
  generateToken(user) {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, this.jwtSecret, { 
        expiresIn: this.jwtExpiresIn,
        issuer: 'hostdime-price-mvp',
        subject: user.id
      });
    } catch (error) {
      console.error('❌ Error generating token:', error);
      throw new Error('Erro ao gerar token de autenticação');
    }
  }

  // Verificar JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      console.error('❌ Error verifying token:', error);
      return null;
    }
  }

  // Buscar usuário por email
  async findUserByEmail(email) {
    try {
      const result = await query(
        'SELECT id, email, password_hash, name, is_admin, is_active FROM users WHERE email = $1 AND is_active = true',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  // Buscar usuário por ID
  async findUserById(id) {
    try {
      const result = await query(
        'SELECT id, email, name, is_admin, is_active, created_at FROM users WHERE id = $1 AND is_active = true',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      return null;
    }
  }

  // Criar usuário
  async createUser(email, password, name, isAdmin = false) {
    try {
      const hashedPassword = await this.hashPassword(password);
      
      const result = await query(
        'INSERT INTO users (email, password_hash, name, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, name, is_admin',
        [email, hashedPassword, name, isAdmin]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email já está em uso');
      }
      
      throw new Error('Erro ao criar usuário');
    }
  }

  // Fazer login
  async login(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        return { success: false, error: 'Email ou senha inválidos' };
      }

      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        return { success: false, error: 'Email ou senha inválidos' };
      }

      // Atualizar último login
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      const token = this.generateToken(user);
      
      // Salvar sessão no banco
      await this.saveSession(user.id, token);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.is_admin
        }
      };
    } catch (error) {
      console.error('❌ Error during login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Salvar sessão
  async saveSession(userId, token) {
    try {
      const tokenHash = await bcrypt.hash(token, 6); // Hash leve para sessão
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      await query(
        'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt]
      );
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  }

  // Limpar sessões expiradas
  async cleanExpiredSessions() {
    try {
      const result = await query(
        'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false'
      );
      console.log(`🧹 Cleaned ${result.rowCount} expired sessions`);
    } catch (error) {
      console.error('❌ Error cleaning expired sessions:', error);
    }
  }

  // Invalidar todas as sessões de um usuário
  async invalidateUserSessions(userId) {
    try {
      await query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        [userId]
      );
    } catch (error) {
      console.error('❌ Error invalidating user sessions:', error);
    }
  }

  // Criar usuário admin inicial se não existir
  async createInitialAdmin() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminName = process.env.ADMIN_NAME || 'Administrador';

      if (!adminEmail || !adminPassword) {
        console.log('⚠️ Admin credentials not set in environment variables');
        return;
      }

      const existingAdmin = await this.findUserByEmail(adminEmail);
      
      if (!existingAdmin) {
        const admin = await this.createUser(adminEmail, adminPassword, adminName, true);
        console.log('✅ Initial admin user created:', admin.email);
      } else {
        console.log('ℹ️ Admin user already exists:', existingAdmin.email);
      }
    } catch (error) {
      console.error('❌ Error creating initial admin:', error);
    }
  }
}

module.exports = new AuthService();
