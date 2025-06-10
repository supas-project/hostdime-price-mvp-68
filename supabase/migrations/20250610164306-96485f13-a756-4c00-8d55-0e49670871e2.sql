
-- Remove a tabela price_data e estruturas relacionadas
DROP TABLE IF EXISTS public.price_data CASCADE;
DROP TABLE IF EXISTS public.price_data_updates CASCADE;

-- Remove qualquer trigger ou função relacionada se existir
DROP FUNCTION IF EXISTS public.log_price_data_changes() CASCADE;
DROP FUNCTION IF EXISTS public.update_price_data_timestamp() CASCADE;
