const authService = require('../services/authService');

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso não fornecido'
      });
    }

    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({
        success: false,
        error: 'Token de acesso inválido ou expirado'
      });
    }

    // Verificar se o usuário ainda existe e está ativo
    const user = await authService.findUserById(decoded.id);
    
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar dados do usuário na requisição
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin
    };

    next();
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno de autenticação'
    });
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação necessária'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: permissões de administrador necessárias'
    });
  }

  next();
};

// Middleware opcional de autenticação (não falha se não autenticado)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verifyToken(token);
      
      if (decoded) {
        const user = await authService.findUserById(decoded.id);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.is_admin
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error('❌ Optional auth middleware error:', error);
    // Continuar mesmo com erro na autenticação opcional
    next();
  }
};

// Middleware para rate limiting simples
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientId);
    
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas. Tente novamente em alguns minutos.'
      });
    }
    
    clientData.count++;
    next();
  };
};

// Limpar rate limit map periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(clientId);
    }
  }
}, 5 * 60 * 1000); // Limpar a cada 5 minutos

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  rateLimit
};
