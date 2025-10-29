-- Atualizar função para trial de 7 dias
CREATE OR REPLACE FUNCTION public.get_subscription_details(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan, status, trial_ends_at, current_period_end)
    VALUES (
      p_user_id, 
      'functional'::subscription_plan, 
      'trial'::subscription_status,
      now() + interval '7 days',
      now() + interval '7 days'
    )
    RETURNING * INTO v_subscription;
  END IF;

  IF v_subscription.status = 'trial' AND v_subscription.trial_ends_at < now() THEN
    UPDATE subscriptions
    SET status = 'expired'::subscription_status
    WHERE user_id = p_user_id
    RETURNING * INTO v_subscription;
  END IF;

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
$function$;