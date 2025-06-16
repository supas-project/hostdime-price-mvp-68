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

  // Buscar itens por categoria
  async getItemsByCategory(categoryName) {
    try {
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
          AND c.display_name = $1
        ORDER BY pi.sort_order ASC, pi.name ASC
      `, [categoryName]);

      return result.rows.map(item => ({
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
  async getItemById(id) {
    try {
      const result = await query(`
        SELECT 
          pi.id,
          pi.name,
          pi.description,
          pi.price,
          pi.specifications,
          c.display_name as category
        FROM price_items pi
        JOIN categories c ON pi.category_id = c.id
        WHERE pi.id = $1 AND pi.is_active = true AND c.is_active = true
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const item = result.rows[0];
      return {
        id: item.id,
        category: item.category,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        specifications: item.specifications || []
      };
    } catch (error) {
      console.error('❌ Error fetching item by ID:', error);
      throw new Error('Erro ao buscar item');
    }
  }

  // Criar novo item (apenas admin)
  async createItem(categoryId, name, description, price, specifications = []) {
    try {
      const result = await query(`
        INSERT INTO price_items (category_id, name, description, price, specifications)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, description, price, specifications
      `, [categoryId, name, description, price, JSON.stringify(specifications)]);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating item:', error);
      throw new Error('Erro ao criar item');
    }
  }

  // Atualizar item (apenas admin)
  async updateItem(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (['name', 'description', 'price', 'specifications', 'category_id'].includes(key)) {
          fields.push(`${key === 'category_id' ? 'category_id' : key} = $${paramCount}`);
          values.push(key === 'specifications' ? JSON.stringify(updates[key]) : updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('Nenhum campo válido para atualizar');
      }

      values.push(id);
      
      const result = await query(`
        UPDATE price_items 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_active = true
        RETURNING id, name, description, price, specifications
      `, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error updating item:', error);
      throw new Error('Erro ao atualizar item');
    }
  }

  // Desativar item (soft delete - apenas admin)
  async deleteItem(id) {
    try {
      const result = await query(`
        UPDATE price_items 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `, [id]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw new Error('Erro ao deletar item');
    }
  }

  // Buscar estatísticas
  async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(DISTINCT category_id) as total_categories,
          AVG(price) as average_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM price_items pi
        JOIN categories c ON pi.category_id = c.id
        WHERE pi.is_active = true AND c.is_active = true
      `);

      return {
        totalItems: parseInt(result.rows[0].total_items),
        totalCategories: parseInt(result.rows[0].total_categories),
        averagePrice: parseFloat(result.rows[0].average_price) || 0,
        minPrice: parseFloat(result.rows[0].min_price) || 0,
        maxPrice: parseFloat(result.rows[0].max_price) || 0
      };
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw new Error('Erro ao buscar estatísticas');
    }
  }
}

module.exports = new PriceService();
