
-- Remove categorias vazias ou com poucos itens do banco de dados
-- Primeiro, vamos buscar os dados atuais para ver o que temos
SELECT id, data FROM price_data ORDER BY created_at DESC LIMIT 1;

-- Depois de verificar, vamos limpar as categorias vazias
-- Vou atualizar os dados removendo categorias que não deveriam estar lá
UPDATE price_data 
SET data = jsonb_strip_nulls(
  data 
  - 'storage' 
  - 'external_storage' 
  - 'disk'
  - 'connectivity'
  - 'port_speed'
  - 'ip_blocks'
  - 'serviçospersonalizados'
),
updated_at = NOW()
WHERE id IN (
  SELECT id FROM price_data ORDER BY created_at DESC LIMIT 1
);

-- Verificar o resultado
SELECT id, jsonb_object_keys(data) as categories FROM price_data ORDER BY created_at DESC LIMIT 1;
