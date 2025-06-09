
-- Ensure all tables have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_components_type ON system_components(component_type);
CREATE INDEX IF NOT EXISTS idx_system_components_active ON system_components(is_active);
CREATE INDEX IF NOT EXISTS idx_datacenters_active ON datacenters(is_active);
CREATE INDEX IF NOT EXISTS idx_contract_types_active ON contract_types(is_active);
CREATE INDEX IF NOT EXISTS idx_storage_items_type ON storage_items(storage_type);
CREATE INDEX IF NOT EXISTS idx_storage_items_active ON storage_items(is_active);

-- Add unique constraints to prevent duplicates during migration (using DO block for conditional creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_component_type_id') THEN
        ALTER TABLE system_components ADD CONSTRAINT unique_component_type_id UNIQUE(component_type, component_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_datacenter_id') THEN
        ALTER TABLE datacenters ADD CONSTRAINT unique_datacenter_id UNIQUE(datacenter_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_contract_id') THEN
        ALTER TABLE contract_types ADD CONSTRAINT unique_contract_id UNIQUE(contract_id);
    END IF;
END $$;

-- Ensure price_data table has proper structure for consolidated data
CREATE TABLE IF NOT EXISTS consolidated_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consolidated_data_type ON consolidated_data(data_type);
CREATE INDEX IF NOT EXISTS idx_consolidated_data_version ON consolidated_data(data_type, version DESC);

-- Add system settings for data consolidation tracking
INSERT INTO system_settings (key, value, description)
VALUES 
  ('data_consolidation_status', '{"phase": "starting", "completed_steps": []}', 'Track data consolidation progress'),
  ('data_version', '{"current": 1, "last_migration": null}', 'Track data version for consistency')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
