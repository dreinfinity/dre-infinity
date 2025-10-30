-- Dropar função existente e recriar com verificação de trial expirado
DROP FUNCTION IF EXISTS get_subscription_details(uuid);

CREATE OR REPLACE FUNCTION get_subscription_details(p_user_id uuid)
RETURNS TABLE (
  plan subscription_plan,
  status subscription_status,
  trial_ends_at timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  is_active boolean,
  is_trial boolean,
  days_until_expiry integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan,
    s.status,
    s.trial_ends_at,
    s.current_period_start,
    s.current_period_end,
    CASE 
      WHEN s.status = 'active' THEN true
      WHEN s.status = 'trial' AND s.trial_ends_at > now() THEN true
      ELSE false
    END as is_active,
    (s.status = 'trial') as is_trial,
    CASE 
      WHEN s.status = 'trial' THEN GREATEST(0, EXTRACT(DAY FROM (s.trial_ends_at - now()))::integer)
      ELSE GREATEST(0, EXTRACT(DAY FROM (s.current_period_end - now()))::integer)
    END as days_until_expiry
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para verificar acesso a features baseado no plano
CREATE OR REPLACE FUNCTION check_feature_access(p_user_id uuid, p_feature text)
RETURNS boolean AS $$
DECLARE
  v_subscription_plan subscription_plan;
  v_is_active boolean;
BEGIN
  -- Buscar plano e status da subscription
  SELECT s.plan, 
    CASE 
      WHEN s.status = 'active' THEN true
      WHEN s.status = 'trial' AND s.trial_ends_at > now() THEN true
      ELSE false
    END
  INTO v_subscription_plan, v_is_active
  FROM subscriptions s
  WHERE s.user_id = p_user_id
  LIMIT 1;

  -- Se não tem subscription ativa, não tem acesso
  IF NOT v_is_active THEN
    RETURN false;
  END IF;

  -- Lógica de acesso por feature
  -- Functional: básico
  -- Growth: básico + avançado
  -- Infinity: tudo

  CASE v_subscription_plan
    WHEN 'infinity' THEN
      RETURN true;
    WHEN 'growth' THEN
      -- Growth tem acesso a tudo exceto features exclusivas do Infinity
      RETURN p_feature NOT IN ('cash_module', 'advanced_dashboard', 'unlimited_companies');
    WHEN 'functional' THEN
      -- Functional tem acesso apenas ao básico
      RETURN p_feature IN ('basic_dashboard', 'basic_reports', 'transactions');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;