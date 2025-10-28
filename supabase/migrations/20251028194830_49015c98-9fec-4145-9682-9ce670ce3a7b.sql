-- Sistema de Planos e Assinaturas (Freemium)

-- Criar enum para os planos
CREATE TYPE public.subscription_plan AS ENUM ('functional', 'growth', 'infinity');

-- Criar enum para status de assinatura
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired');

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'functional',
  status subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 month'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins podem ver e gerenciar todas as assinaturas
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar se usuário tem acesso a uma feature
CREATE OR REPLACE FUNCTION public.check_feature_access(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_plan subscription_plan;
  v_status subscription_status;
  v_trial_ends_at TIMESTAMPTZ;
BEGIN
  -- Buscar plano e status do usuário
  SELECT plan, status, trial_ends_at INTO v_plan, v_status, v_trial_ends_at
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- Se não tem assinatura, criar trial de 14 dias
  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan, status, trial_ends_at, current_period_end)
    VALUES (
      p_user_id, 
      'functional'::subscription_plan, 
      'trial'::subscription_status,
      now() + interval '14 days',
      now() + interval '14 days'
    );
    v_plan := 'functional'::subscription_plan;
    v_status := 'trial'::subscription_status;
    v_trial_ends_at := now() + interval '14 days';
  END IF;

  -- Verificar se trial expirou
  IF v_status = 'trial' AND v_trial_ends_at < now() THEN
    UPDATE subscriptions
    SET status = 'expired'::subscription_status
    WHERE user_id = p_user_id;
    v_status := 'expired'::subscription_status;
  END IF;

  -- Se assinatura expirada ou cancelada, bloquear tudo exceto básico
  IF v_status IN ('expired', 'cancelled') THEN
    RETURN p_feature IN ('dashboard', 'transactions', 'settings');
  END IF;

  -- Regras de acesso por plano
  CASE v_plan
    WHEN 'functional' THEN
      -- Functional: Básico + Relatórios limitados
      RETURN p_feature IN (
        'dashboard', 'transactions', 'reports', 'settings',
        'basic_reports', 'monthly_limits'
      );
    
    WHEN 'growth' THEN
      -- Growth: Tudo do Functional + Análises avançadas + Metas
      RETURN p_feature IN (
        'dashboard', 'transactions', 'reports', 'settings',
        'basic_reports', 'monthly_limits',
        'goals', 'break_even', 'horizontal_analysis', 'export_excel',
        'unlimited_transactions', 'multiple_companies_3'
      );
    
    WHEN 'infinity' THEN
      -- Infinity: Acesso total ilimitado
      RETURN true;
    
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Função para obter detalhes da assinatura
CREATE OR REPLACE FUNCTION public.get_subscription_details(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSONB;
  v_subscription RECORD;
BEGIN
  -- Buscar assinatura do usuário
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- Se não tem assinatura, criar trial
  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan, status, trial_ends_at, current_period_end)
    VALUES (
      p_user_id, 
      'functional'::subscription_plan, 
      'trial'::subscription_status,
      now() + interval '14 days',
      now() + interval '14 days'
    )
    RETURNING * INTO v_subscription;
  END IF;

  -- Verificar se trial expirou
  IF v_subscription.status = 'trial' AND v_subscription.trial_ends_at < now() THEN
    UPDATE subscriptions
    SET status = 'expired'::subscription_status
    WHERE user_id = p_user_id
    RETURNING * INTO v_subscription;
  END IF;

  -- Montar resposta
  v_result := jsonb_build_object(
    'plan', v_subscription.plan,
    'status', v_subscription.status,
    'trialEndsAt', v_subscription.trial_ends_at,
    'currentPeriodStart', v_subscription.current_period_start,
    'currentPeriodEnd', v_subscription.current_period_end,
    'isActive', v_subscription.status IN ('trial', 'active'),
    'isTrial', v_subscription.status = 'trial',
    'daysUntilExpiry', CASE 
      WHEN v_subscription.status = 'trial' THEN 
        EXTRACT(DAY FROM (v_subscription.trial_ends_at - now()))
      ELSE 
        EXTRACT(DAY FROM (v_subscription.current_period_end - now()))
    END
  );

  RETURN v_result;
END;
$$;