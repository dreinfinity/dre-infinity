-- Criar tabela de cofres (vaults)
CREATE TABLE public.cash_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vault_type TEXT NOT NULL CHECK (vault_type IN ('emergency_reserve', 'working_capital', 'investments', 'withdrawals')),
  current_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, vault_type)
);

-- Índices para performance
CREATE INDEX idx_cash_vaults_company ON public.cash_vaults(company_id);
CREATE INDEX idx_cash_vaults_type ON public.cash_vaults(vault_type);

-- RLS Policies
ALTER TABLE public.cash_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vaults of their companies"
  ON public.cash_vaults FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_vaults.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage vaults of their companies"
  ON public.cash_vaults FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_vaults.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Trigger para updated_at
CREATE TRIGGER update_cash_vaults_updated_at
  BEFORE UPDATE ON public.cash_vaults
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de transações de caixa
CREATE TABLE public.cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vault_type TEXT NOT NULL CHECK (vault_type IN ('emergency_reserve', 'working_capital', 'investments', 'withdrawals', 'main_balance')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw', 'transfer_in', 'transfer_out')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  related_vault_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_cash_transactions_company ON public.cash_transactions(company_id);
CREATE INDEX idx_cash_transactions_vault ON public.cash_transactions(vault_type);
CREATE INDEX idx_cash_transactions_created ON public.cash_transactions(created_at DESC);
CREATE INDEX idx_cash_transactions_tags ON public.cash_transactions USING GIN(tags);

-- RLS Policies
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cash transactions of their companies"
  ON public.cash_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_transactions.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert cash transactions for their companies"
  ON public.cash_transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_transactions.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update cash transactions of their companies"
  ON public.cash_transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_transactions.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete cash transactions of their companies"
  ON public.cash_transactions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_transactions.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Criar tabela de etiquetas
CREATE TABLE public.cash_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Índices
CREATE INDEX idx_cash_tags_company ON public.cash_tags(company_id);

-- RLS Policies
ALTER TABLE public.cash_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tags of their companies"
  ON public.cash_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = cash_tags.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Função para calcular saldos
CREATE OR REPLACE FUNCTION public.calculate_cash_balances(p_company_id UUID)
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
BEGIN
  -- Calcular saldo total (soma de todas as receitas)
  SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND c.category_type = 'revenue'::category_type
    AND c.is_active = true;

  -- Calcular custos totais
  SELECT COALESCE(SUM(amount), 0) INTO v_total_costs
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND c.category_type = 'cost'::category_type
    AND c.is_active = true;

  -- Calcular despesas totais
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND c.category_type = 'expense'::category_type
    AND c.is_active = true;

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

  RETURN jsonb_build_object(
    'totalBalance', v_total_balance,
    'netBalance', v_net_balance,
    'emergencyReserve', v_emergency_reserve,
    'workingCapital', v_working_capital,
    'investments', v_investments,
    'withdrawals', v_withdrawals,
    'availableBalance', v_net_balance - v_emergency_reserve - v_working_capital - v_investments - v_withdrawals
  );
END;
$$;

-- Função para transferências entre cofres
CREATE OR REPLACE FUNCTION public.transfer_between_vaults(
  p_company_id UUID,
  p_from_vault TEXT,
  p_to_vault TEXT,
  p_amount NUMERIC,
  p_description TEXT,
  p_tags JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_from_balance NUMERIC := 0;
  v_available_balance NUMERIC := 0;
BEGIN
  -- Validar empresa
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Empresa não encontrada';
  END IF;

  -- Validar valores
  IF p_from_vault = p_to_vault THEN
    RAISE EXCEPTION 'Não é possível transferir para o mesmo cofre';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  -- Validar retiradas (não pode retirar de 'withdrawals')
  IF p_from_vault = 'withdrawals' THEN
    RAISE EXCEPTION 'Não é possível retirar dinheiro de Retiradas';
  END IF;

  -- Buscar saldo disponível
  IF p_from_vault = 'main_balance' THEN
    SELECT (data->>'availableBalance')::NUMERIC INTO v_available_balance
    FROM (SELECT calculate_cash_balances(p_company_id) as data) x;
    
    IF v_available_balance < p_amount THEN
      RAISE EXCEPTION 'Saldo insuficiente. Disponível: R$ %, Solicitado: R$ %', v_available_balance, p_amount;
    END IF;
  ELSE
    SELECT COALESCE(current_balance, 0) INTO v_from_balance
    FROM cash_vaults
    WHERE company_id = p_company_id AND vault_type = p_from_vault;

    IF v_from_balance < p_amount THEN
      RAISE EXCEPTION 'Saldo insuficiente no cofre. Disponível: R$ %, Solicitado: R$ %', v_from_balance, p_amount;
    END IF;
  END IF;

  -- Realizar transferência
  -- 1. Debitar origem (se não for main_balance)
  IF p_from_vault != 'main_balance' THEN
    UPDATE cash_vaults
    SET current_balance = current_balance - p_amount
    WHERE company_id = p_company_id AND vault_type = p_from_vault;

    INSERT INTO cash_transactions (company_id, vault_type, transaction_type, amount, description, tags, related_vault_type, created_by)
    VALUES (p_company_id, p_from_vault, 'transfer_out', p_amount, p_description, p_tags, p_to_vault, auth.uid());
  END IF;

  -- 2. Creditar destino (se não for main_balance)
  IF p_to_vault != 'main_balance' THEN
    INSERT INTO cash_vaults (company_id, vault_type, current_balance)
    VALUES (p_company_id, p_to_vault, p_amount)
    ON CONFLICT (company_id, vault_type)
    DO UPDATE SET current_balance = cash_vaults.current_balance + p_amount;

    INSERT INTO cash_transactions (company_id, vault_type, transaction_type, amount, description, tags, related_vault_type, created_by)
    VALUES (p_company_id, p_to_vault, 'transfer_in', p_amount, p_description, p_tags, p_from_vault, auth.uid());
  ELSE
    -- Se destino é main_balance, registrar apenas retirada
    INSERT INTO cash_transactions (company_id, vault_type, transaction_type, amount, description, tags, related_vault_type, created_by)
    VALUES (p_company_id, 'main_balance', 'transfer_in', p_amount, p_description, p_tags, p_from_vault, auth.uid());
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Transferência realizada com sucesso');
END;
$$;