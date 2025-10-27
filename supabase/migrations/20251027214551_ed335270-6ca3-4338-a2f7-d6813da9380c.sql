-- Renomear coluna last_updated para updated_at na tabela tax_configurations
-- Isso corrige o erro do trigger que espera uma coluna chamada updated_at
ALTER TABLE public.tax_configurations
RENAME COLUMN last_updated TO updated_at;