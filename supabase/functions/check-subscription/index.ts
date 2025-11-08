import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email, createdAt: user.created_at });

    // Calculate trial period (7 days from user creation)
    const userCreatedAt = new Date(user.created_at);
    const trialEndDate = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const isTrialActive = now < trialEndDate;
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    logStep("Trial calculation", { 
      userCreatedAt: userCreatedAt.toISOString(), 
      trialEndDate: trialEndDate.toISOString(),
      isTrialActive,
      daysRemaining 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning trial status");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan: 'functional', 
        isTrial: isTrialActive,
        subscription_end: trialEndDate.toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let plan = 'functional';
    let subscriptionEnd: string | null = null;
    let isSubscriptionTrial = false;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      isSubscriptionTrial = subscription.status === 'trialing';
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd, isTrial: isSubscriptionTrial });
      
      const priceId = subscription.items.data[0].price.id;
      
      // Mapear price ID para plano
      const planMapping: Record<string, string> = {
        'price_1SPVszCJNzE5MXKSCNhy9L6u': 'functional',
        'price_1SPVf1CJNzE5MXKShs5cCdHG': 'growth',
        'price_1SPVtvCJNzE5MXKSxRhoAdZG': 'infinity',
      };
      
      plan = planMapping[priceId] || 'functional';
      logStep("Determined plan", { plan, priceId });
    } else {
      logStep("No active subscription found, using trial period");
      // Se não tem subscription ativa, usa o período de trial baseado na data de criação
      subscriptionEnd = trialEndDate.toISOString();
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      subscription_end: subscriptionEnd,
      isTrial: hasActiveSub ? isSubscriptionTrial : isTrialActive,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
