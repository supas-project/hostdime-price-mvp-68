const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.connection = null;
    this.dbType = 'postgresql';
  }

  // Configurar conexão com banco
  setConnection(connection, dbType) {
    this.connection = connection;
    this.dbType = dbType;
    console.log('🔗 AuthService configurado para:', dbType);
  }

  // Executar query baseada no tipo de banco
  async executeQuery(sql, params = []) {
    if (!this.connection) {
      throw new Error('Conexão com banco não configurada');
    }

    if (this.dbType === 'postgresql') {
      const result = await this.connection.query(sql, params);
      return result.rows;
    } else if (this.dbType === 'sqlite') {
      return new Promise((resolve, reject) => {
        if (sql.toLowerCase().includes('select')) {
          this.connection.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          this.connection.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ insertId: this.lastID, changes: this.changes });
          });
        }
      });
    }
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
  generateToken(payload) {
    try {
      return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    } catch (error) {
      console.error('❌ Error generating token:', error);
      throw new Error('Erro ao gerar token');
    }
  }

  // Verificar JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      console.error('❌ Error verifying token:', error);
      throw new Error('Token inválido');
    }
  }

  // Buscar usuário por email
  async getUserByEmail(email) {
    try {
      const result = await this.executeQuery(`
        SELECT id, email, password_hash, full_name, role, is_active, created_at
        FROM users 
        WHERE email = $1 AND is_active = true
      `, [email]);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('❌ Error fetching user by email:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Buscar usuário por ID
  async getUserById(userId) {
    try {
      const result = await this.executeQuery(`
        SELECT id, email, full_name, role, is_active, created_at
        FROM users 
        WHERE id = $1 AND is_active = true
      `, [userId]);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('❌ Error fetching user by ID:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Login do usuário
  async login(email, password) {
    try {
      // Buscar usuário
      const user = await this.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'Credenciais inválidas'
        };
      }

      // Verificar senha
      const isPasswordValid = await this.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Credenciais inválidas'
        };
      }

      // Gerar token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      };
    } catch (error) {
      console.error('❌ Error in login:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Criar usuário admin padrão
  async createDefaultAdmin() {
    try {
      // Verificar se já existe um admin
      const existingAdmin = await this.executeQuery(`
        SELECT id FROM users WHERE role = 'admin' LIMIT 1
      `);

      if (existingAdmin.length > 0) {
        console.log('👤 Admin já existe, pulando criação');
        return;
      }

      // Criar admin padrão
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@hostdime.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminName = process.env.ADMIN_NAME || 'Administrador';

      const passwordHash = await this.hashPassword(adminPassword);

      await this.executeQuery(`
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES ($1, $2, $3, 'admin', true)
      `, [adminEmail, passwordHash, adminName]);

      console.log('✅ Admin padrão criado:', adminEmail);
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
    }
  }

  // Middleware de autenticação
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido'
      });
    }
  }

  // Middleware de autorização admin
  requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Privilégios de administrador requeridos.'
      });
    }
  }

  // Registro de novo usuário (somente admin pode criar)
  async register(userData) {
    try {
      const { email, password, full_name, role = 'user' } = userData;

      // Verificar se usuário já existe
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'E-mail já está em uso'
        };
      }

      // Hash da senha
      const passwordHash = await this.hashPassword(password);

      // Inserir usuário
      const result = await this.executeQuery(`
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING id, email, full_name, role
      `, [email, passwordHash, full_name, role]);

      return {
        success: true,
        data: result[0],
        message: 'Usuário criado com sucesso'
      };
    } catch (error) {
      console.error('❌ Error registering user:', error);
      return {
        success: false,
        error: 'Erro ao criar usuário'
      };
    }
  }

  // Atualizar usuário
  async updateUser(userId, updateData) {
    try {
      const { full_name, role } = updateData;
      
      const result = await this.executeQuery(`
        UPDATE users 
        SET full_name = COALESCE($2, full_name),
            role = COALESCE($3, role),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = true
        RETURNING id, email, full_name, role
      `, [userId, full_name, role]);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      return {
        success: true,
        data: result[0],
        message: 'Usuário atualizado com sucesso'
      };
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return {
        success: false,
        error: 'Erro ao atualizar usuário'
      };
    }
  }

  // Listar usuários (admin only)
  async getAllUsers() {
    try {
      const result = await this.executeQuery(`
        SELECT id, email, full_name, role, is_active, created_at
        FROM users 
        WHERE is_active = true
        ORDER BY created_at DESC
      `);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return {
        success: false,
        error: 'Erro ao buscar usuários'
      };
    }
  }
}

// Exportar instância única (singleton)
module.exports = new AuthService();
