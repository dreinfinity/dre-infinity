-- ==========================================
-- Função RPC: get_dre_report
-- Calcula e retorna a estrutura completa da DRE
-- para um período específico (mês/ano)
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_dre_report(
  company_id_param UUID,
  month_param INTEGER,
  year_param INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_receita_bruta NUMERIC := 0;
  v_cmv NUMERIC := 0;
  v_despesas_operacionais NUMERIC := 0;
  v_despesas_financeiras NUMERIC := 0;
  v_receitas_financeiras NUMERIC := 0;
  v_icms NUMERIC := 0;
  v_ipi NUMERIC := 0;
  v_pis NUMERIC := 0;
  v_cofins NUMERIC := 0;
  v_iss NUMERIC := 0;
  v_das NUMERIC := 0;
  v_deducoes_total NUMERIC := 0;
  v_receita_liquida NUMERIC := 0;
  v_lucro_bruto NUMERIC := 0;
  v_lucro_operacional NUMERIC := 0;
  v_lair NUMERIC := 0;
  v_irpj NUMERIC := 0;
  v_irpj_adicional NUMERIC := 0;
  v_csll NUMERIC := 0;
  v_impostos_total NUMERIC := 0;
  v_lucro_liquido NUMERIC := 0;
  v_margem_bruta NUMERIC := 0;
  v_margem_operacional NUMERIC := 0;
  v_margem_liquida NUMERIC := 0;
  v_use_das BOOLEAN := false;
  v_das_rate NUMERIC := 0.06;
  v_icms_rate NUMERIC := 0.18;
  v_ipi_rate NUMERIC := 0.10;
  v_pis_rate NUMERIC := 0.0165;
  v_cofins_rate NUMERIC := 0.076;
  v_iss_rate NUMERIC := 0.05;
  v_irpj_rate NUMERIC := 0.15;
  v_irpj_additional_rate NUMERIC := 0.10;
  v_irpj_additional_threshold NUMERIC := 20000;
  v_csll_rate NUMERIC := 0.09;
  v_result JSONB;
BEGIN
  -- Buscar configurações de impostos
  SELECT 
    COALESCE(use_das, false),
    COALESCE(das_rate, 0.06),
    COALESCE(icms_rate, 0.18),
    COALESCE(ipi_rate, 0.10),
    COALESCE(pis_rate, 0.0165),
    COALESCE(cofins_rate, 0.076),
    COALESCE(iss_rate, 0.05),
    COALESCE(irpj_rate, 0.15),
    COALESCE(irpj_additional_rate, 0.10),
    COALESCE(irpj_additional_threshold, 20000),
    COALESCE(csll_rate, 0.09)
  INTO 
    v_use_das, v_das_rate, v_icms_rate, v_ipi_rate, 
    v_pis_rate, v_cofins_rate, v_iss_rate,
    v_irpj_rate, v_irpj_additional_rate, v_irpj_additional_threshold, v_csll_rate
  FROM tax_configurations
  WHERE company_id = company_id_param
  LIMIT 1;

  -- Calcular Receita Bruta
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_receita_bruta
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = company_id_param
    AND t.month = month_param
    AND t.year = year_param
    AND c.category_type = 'revenue'::category_type
    AND c.is_active = true;

  -- Calcular CMV
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_cmv
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = company_id_param
    AND t.month = month_param
    AND t.year = year_param
    AND c.category_type = 'cost'::category_type
    AND c.is_active = true;

  -- Calcular Despesas Operacionais e Financeiras
  SELECT 
    COALESCE(SUM(CASE 
      WHEN LOWER(c.name) LIKE '%financeira%' THEN 0
      ELSE t.amount 
    END), 0),
    COALESCE(SUM(CASE 
      WHEN LOWER(c.name) LIKE '%financeira%' THEN t.amount
      ELSE 0 
    END), 0)
  INTO v_despesas_operacionais, v_despesas_financeiras
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = company_id_param
    AND t.month = month_param
    AND t.year = year_param
    AND c.category_type = 'expense'::category_type
    AND c.is_active = true;

  -- Calcular Deduções (Impostos sobre Vendas)
  IF v_use_das THEN
    v_das := v_receita_bruta * v_das_rate;
    v_deducoes_total := v_das;
  ELSE
    v_icms := v_receita_bruta * v_icms_rate;
    v_ipi := v_receita_bruta * v_ipi_rate;
    v_pis := v_receita_bruta * v_pis_rate;
    v_cofins := v_receita_bruta * v_cofins_rate;
    v_iss := v_receita_bruta * v_iss_rate;
    v_deducoes_total := v_icms + v_ipi + v_pis + v_cofins + v_iss;
  END IF;

  -- Calcular estrutura da DRE
  v_receita_liquida := v_receita_bruta - v_deducoes_total;
  v_lucro_bruto := v_receita_liquida - v_cmv;
  v_lucro_operacional := v_lucro_bruto - v_despesas_operacionais;
  v_lair := v_lucro_operacional + v_receitas_financeiras - v_despesas_financeiras;

  -- Calcular impostos sobre lucro
  IF v_lair > 0 THEN
    v_irpj := v_lair * v_irpj_rate;
    
    IF v_lair > v_irpj_additional_threshold THEN
      v_irpj_adicional := (v_lair - v_irpj_additional_threshold) * v_irpj_additional_rate;
    END IF;
    
    v_csll := v_lair * v_csll_rate;
  END IF;

  v_impostos_total := v_irpj + v_irpj_adicional + v_csll;
  v_lucro_liquido := v_lair - v_impostos_total;

  -- Calcular margens
  IF v_receita_liquida > 0 THEN
    v_margem_bruta := (v_lucro_bruto / v_receita_liquida) * 100;
    v_margem_operacional := (v_lucro_operacional / v_receita_liquida) * 100;
    v_margem_liquida := (v_lucro_liquido / v_receita_liquida) * 100;
  END IF;

  -- Construir JSON de retorno
  v_result := jsonb_build_object(
    'receitaBruta', v_receita_bruta,
    'icms', v_icms,
    'ipi', v_ipi,
    'pis', v_pis,
    'cofins', v_cofins,
    'iss', v_iss,
    'das', v_das,
    'use_das', v_use_das,
    'deducoesTotal', v_deducoes_total,
    'receitaLiquida', v_receita_liquida,
    'cmv', v_cmv,
    'lucroBruto', v_lucro_bruto,
    'despesasOperacionais', v_despesas_operacionais,
    'lucroOperacional', v_lucro_operacional,
    'despesasFinanceiras', v_despesas_financeiras,
    'receitasFinanceiras', v_receitas_financeiras,
    'lair', v_lair,
    'irpj', v_irpj,
    'irpjAdicional', v_irpj_adicional,
    'csll', v_csll,
    'impostosTotal', v_impostos_total,
    'lucroLiquido', v_lucro_liquido,
    'margemBruta', v_margem_bruta,
    'margemOperacional', v_margem_operacional,
    'margemLiquida', v_margem_liquida,
    'avDeducoes', CASE WHEN v_receita_liquida > 0 THEN (v_deducoes_total / v_receita_liquida) * 100 ELSE 0 END,
    'avCmv', CASE WHEN v_receita_liquida > 0 THEN (v_cmv / v_receita_liquida) * 100 ELSE 0 END,
    'avDespesasOperacionais', CASE WHEN v_receita_liquida > 0 THEN (v_despesas_operacionais / v_receita_liquida) * 100 ELSE 0 END,
    'avDespesasFinanceiras', CASE WHEN v_receita_liquida > 0 THEN (v_despesas_financeiras / v_receita_liquida) * 100 ELSE 0 END,
    'avReceitasFinanceiras', CASE WHEN v_receita_liquida > 0 THEN (v_receitas_financeiras / v_receita_liquida) * 100 ELSE 0 END,
    'avImpostos', CASE WHEN v_receita_liquida > 0 THEN (v_impostos_total / v_receita_liquida) * 100 ELSE 0 END
  );

  RETURN v_result;
END;
$$;