class PriceService {
  constructor() {
    this.connection = null;
    this.dbType = 'postgresql'; // padrão
  }

  // Configurar conexão com banco
  setConnection(connection, dbType) {
    this.connection = connection;
    this.dbType = dbType;
    console.log('🔗 PriceService configurado para:', dbType);
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

  // Buscar todas as categorias ativas
  async getCategories() {
    try {
      const result = await this.executeQuery(`
        SELECT id, name, display_name, description, sort_order
        FROM categories 
        WHERE is_active = true 
        ORDER BY sort_order ASC, display_name ASC
      `);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw new Error('Erro ao buscar categorias');
    }
  }

  // Buscar todos os itens de preço ativos
  async getAllPriceItems() {
    try {
      const result = await this.executeQuery(`
        SELECT 
          pi.id,
          pi.name,
          pi.description,
          pi.price,
          pi.specifications,
          pi.sort_order,
          c.display_name as category
        FROM price_items pi
        JOIN categories c ON pi.category_id = c.id
        WHERE pi.is_active = true AND c.is_active = true
        ORDER BY c.sort_order ASC, pi.sort_order ASC, pi.name ASC
      `);

      return result.map(item => ({
        id: item.id,
        category: item.category,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        specifications: item.specifications || []
      }));
    } catch (error) {
      console.error('❌ Error fetching price items:', error);
      throw new Error('Erro ao buscar itens de preço');
    }
  }

  // Buscar itens por categoria (por nome ou ID)
  async getItemsByCategory(categoryIdentifier) {
    try {
      // Determinar se é ID numérico ou nome
      const isNumeric = !isNaN(categoryIdentifier);
      const whereClause = isNumeric ? 'c.id = $1' : 'c.display_name = $1';
      
      const result = await this.executeQuery(`
        SELECT 
          pi.id,
          pi.name,
          pi.description,
          pi.price,
          pi.specifications,
          pi.sort_order
        FROM price_items pi
        JOIN categories c ON pi.category_id = c.id
        WHERE pi.is_active = true 
          AND c.is_active = true 
          AND ${whereClause}
        ORDER BY pi.sort_order ASC, pi.name ASC
      `, [categoryIdentifier]);

      return result.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        specifications: item.specifications || []
      }));
    } catch (error) {
      console.error('❌ Error fetching items by category:', error);
      throw new Error('Erro ao buscar itens da categoria');
    }
  }

  // Buscar item específico por ID
  async getItemById(itemId) {
    try {
      const result = await this.executeQuery(`
        SELECT 
          pi.id,
          pi.name,
          pi.description,
          pi.price,
          pi.specifications,
          pi.sort_order,
          c.display_name as category,
          c.id as category_id
        FROM price_items pi
        JOIN categories c ON pi.category_id = c.id
        WHERE pi.id = $1 AND pi.is_active = true
      `, [itemId]);

      if (result.length === 0) {
        return null;
      }

      const item = result[0];
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        specifications: item.specifications || [],
        category: item.category,
        category_id: item.category_id
      };
    } catch (error) {
      console.error('❌ Error fetching item by ID:', error);
      throw new Error('Erro ao buscar item');
    }
  }

  // Adicionar nova categoria (admin)
  async addCategory(categoryData) {
    try {
      const { name, slug, display_name, description } = categoryData;
      
      const result = await this.executeQuery(`
        INSERT INTO categories (name, slug, display_name, description, is_active, sort_order)
        VALUES ($1, $2, $3, $4, true, 99)
        RETURNING id, name, display_name
      `, [name, slug || name.toLowerCase().replace(/\s+/g, '-'), display_name || name, description || '']);

      return {
        success: true,
        data: result[0],
        message: 'Categoria adicionada com sucesso'
      };
    } catch (error) {
      console.error('❌ Error adding category:', error);
      return {
        success: false,
        error: 'Erro ao adicionar categoria'
      };
    }
  }

  // Adicionar novo item (admin)
  async addItem(itemData) {
    try {
      const { category_id, name, description, price, specifications } = itemData;
      
      const result = await this.executeQuery(`
        INSERT INTO price_items (category_id, name, description, price, specifications, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, true, 99)
        RETURNING id, name, price
      `, [category_id, name, description, price, JSON.stringify(specifications || [])]);

      return {
        success: true,
        data: result[0],
        message: 'Item adicionado com sucesso'
      };
    } catch (error) {
      console.error('❌ Error adding item:', error);
      return {
        success: false,
        error: 'Erro ao adicionar item'
      };
    }
  }

  // Atualizar item existente (admin)
  async updateItem(itemId, updateData) {
    try {
      const { name, description, price, specifications } = updateData;
      
      const result = await this.executeQuery(`
        UPDATE price_items 
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            price = COALESCE($4, price),
            specifications = COALESCE($5, specifications),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = true
        RETURNING id, name, price
      `, [itemId, name, description, price, JSON.stringify(specifications)]);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Item não encontrado'
        };
      }

      return {
        success: true,
        data: result[0],
        message: 'Item atualizado com sucesso'
      };
    } catch (error) {
      console.error('❌ Error updating item:', error);
      return {
        success: false,
        error: 'Erro ao atualizar item'
      };
    }
  }

  // Desativar item (soft delete)
  async deleteItem(itemId) {
    try {
      const result = await this.executeQuery(`
        UPDATE price_items 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name
      `, [itemId]);

      if (result.length === 0) {
        return {
          success: false,
          error: 'Item não encontrado'
        };
      }

      return {
        success: true,
        message: 'Item removido com sucesso'
      };
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      return {
        success: false,
        error: 'Erro ao remover item'
      };
    }
  }

  // Buscar configurações de preços para relatórios
  async getPriceConfiguration() {
    try {
      const categories = await this.getCategories();
      const items = await this.getAllPriceItems();
      
      return {
        success: true,
        data: {
          categories,
          items,
          total_categories: categories.length,
          total_items: items.length,
          last_updated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error fetching price configuration:', error);
      return {
        success: false,
        error: 'Erro ao buscar configuração de preços'
      };
    }
  }
}

// Exportar instância única (singleton)
module.exports = new PriceService();
