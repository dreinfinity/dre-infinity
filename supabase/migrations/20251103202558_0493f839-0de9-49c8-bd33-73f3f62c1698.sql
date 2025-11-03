-- Ajustar função calculate_cash_balances para incluir valores aplicados
CREATE OR REPLACE FUNCTION public.calculate_cash_balances(
  p_company_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_total_balance NUMERIC := 0;
  v_net_balance NUMERIC := 0;
  v_total_revenue NUMERIC := 0;
  v_total_costs NUMERIC := 0;
  v_total_expenses NUMERIC := 0;
  v_emergency_reserve NUMERIC := 0;
  v_working_capital NUMERIC := 0;
  v_investments NUMERIC := 0;
  v_withdrawals NUMERIC := 0;
  v_valores_aplicados NUMERIC := 0;
BEGIN
  -- Calcular receitas com filtro de data opcional
  SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND c.category_type = 'revenue'::category_type
    AND c.is_active = true
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date);

  -- Calcular custos com filtro de data opcional
  SELECT COALESCE(SUM(amount), 0) INTO v_total_costs
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND c.category_type = 'cost'::category_type
    AND c.is_active = true
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date);

  -- Calcular despesas com filtro de data opcional
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND c.category_type = 'expense'::category_type
    AND c.is_active = true
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date);

  v_total_balance := v_total_revenue;
  v_net_balance := v_total_revenue - v_total_costs - v_total_expenses;

  -- Buscar saldos dos cofres
  SELECT COALESCE(current_balance, 0) INTO v_emergency_reserve
  FROM cash_vaults
  WHERE company_id = p_company_id AND vault_type = 'emergency_reserve';

  SELECT COALESCE(current_balance, 0) INTO v_working_capital
  FROM cash_vaults
  WHERE company_id = p_company_id AND vault_type = 'working_capital';

  SELECT COALESCE(current_balance, 0) INTO v_investments
  FROM cash_vaults
  WHERE company_id = p_company_id AND vault_type = 'investments';

  SELECT COALESCE(current_balance, 0) INTO v_withdrawals
  FROM cash_vaults
  WHERE company_id = p_company_id AND vault_type = 'withdrawals';

  -- Calcular valores aplicados (soma de todos os cofres exceto retiradas)
  v_valores_aplicados := v_emergency_reserve + v_working_capital + v_investments;

  RETURN jsonb_build_object(
    'totalBalance', v_total_balance,
    'netBalance', v_net_balance,
    'emergencyReserve', v_emergency_reserve,
    'workingCapital', v_working_capital,
    'investments', v_investments,
    'withdrawals', v_withdrawals,
    'availableBalance', v_net_balance - v_emergency_reserve - v_working_capital - v_investments,
    'valoresAplicados', v_valores_aplicados
  );
END;
$$;

-- Criar trigger para transferir custos e despesas automaticamente para Retiradas
CREATE OR REPLACE FUNCTION auto_transfer_costs_to_withdrawals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_category_type TEXT;
  v_vault_balance NUMERIC;
BEGIN
  -- Verificar se a categoria é custo ou despesa
  SELECT c.category_type::TEXT INTO v_category_type
  FROM dre_categories c
  WHERE c.id = NEW.category_id;

  -- Se for custo ou despesa, criar transferência para retiradas
  IF v_category_type IN ('cost', 'expense') THEN
    -- Garantir que o cofre de retiradas existe
    INSERT INTO cash_vaults (company_id, vault_type, current_balance)
    VALUES (NEW.company_id, 'withdrawals', 0)
    ON CONFLICT (company_id, vault_type) DO NOTHING;

    -- Registrar transação de saída no main_balance
    INSERT INTO cash_transactions (
      company_id,
      vault_type,
      transaction_type,
      amount,
      description,
      tags,
      related_vault_type
    ) VALUES (
      NEW.company_id,
      'main_balance',
      'transfer_out',
      NEW.amount,
      'Transferência automática: ' || NEW.description,
      ARRAY[]::TEXT[],
      'withdrawals'
    );

    -- Registrar transação de entrada em withdrawals
    INSERT INTO cash_transactions (
      company_id,
      vault_type,
      transaction_type,
      amount,
      description,
      tags,
      related_vault_type
    ) VALUES (
      NEW.company_id,
      'withdrawals',
      'transfer_in',
      NEW.amount,
      'Transferência automática: ' || NEW.description,
      ARRAY[]::TEXT[],
      'main_balance'
    );

    -- Atualizar saldo do cofre de retiradas
    UPDATE cash_vaults
    SET current_balance = current_balance + NEW.amount
    WHERE company_id = NEW.company_id AND vault_type = 'withdrawals';
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger na tabela transactions
DROP TRIGGER IF EXISTS trigger_auto_transfer_costs ON transactions;
CREATE TRIGGER trigger_auto_transfer_costs
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_transfer_costs_to_withdrawals();