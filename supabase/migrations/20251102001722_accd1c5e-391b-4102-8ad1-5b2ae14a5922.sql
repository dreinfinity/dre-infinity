-- Adicionar campo markup_type à tabela dre_categories
ALTER TABLE dre_categories 
ADD COLUMN IF NOT EXISTS markup_type TEXT 
CHECK (markup_type IN ('CD', 'DV', 'DF', NULL));

COMMENT ON COLUMN dre_categories.markup_type IS 'Tipo de vínculo para cálculo de Markup: CD (Custo Direto), DV (Despesa Variável), DF (Despesa Fixa)';

-- Criar função RPC para calcular dados do Markup
CREATE OR REPLACE FUNCTION public.get_markup_data(
  company_id_param uuid,
  month_param integer,
  year_param integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_custo_direto_total NUMERIC := 0;
  v_despesas_variaveis NUMERIC := 0;
  v_despesas_fixas NUMERIC := 0;
  v_receita_liquida NUMERIC := 0;
  v_dv_percentual NUMERIC := 0;
  v_df_percentual NUMERIC := 0;
  v_result JSONB;
BEGIN
  -- Buscar receita líquida do período
  SELECT 
    COALESCE((data->>'receitaLiquida')::NUMERIC, 0)
  INTO v_receita_liquida
  FROM (
    SELECT get_dre_report(company_id_param, month_param, year_param) as data
  ) x;

  -- Calcular Custo Direto Total (CD)
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_custo_direto_total
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = company_id_param
    AND t.month = month_param
    AND t.year = year_param
    AND c.markup_type = 'CD'
    AND c.is_active = true;

  -- Calcular Despesas Variáveis (DV)
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_despesas_variaveis
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = company_id_param
    AND t.month = month_param
    AND t.year = year_param
    AND c.markup_type = 'DV'
    AND c.is_active = true;

  -- Calcular Despesas Fixas (DF)
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_despesas_fixas
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = company_id_param
    AND t.month = month_param
    AND t.year = year_param
    AND c.markup_type = 'DF'
    AND c.is_active = true;

  -- Calcular percentuais
  IF v_receita_liquida > 0 THEN
    v_dv_percentual := (v_despesas_variaveis / v_receita_liquida) * 100;
    v_df_percentual := (v_despesas_fixas / v_receita_liquida) * 100;
  END IF;

  -- Construir JSON de retorno
  v_result := jsonb_build_object(
    'custoDiretoTotal', v_custo_direto_total,
    'despesasVariaveis', v_despesas_variaveis,
    'despesasFixas', v_despesas_fixas,
    'receitaLiquida', v_receita_liquida,
    'dvPercentual', v_dv_percentual,
    'dfPercentual', v_df_percentual
  );

  RETURN v_result;
END;
$function$;