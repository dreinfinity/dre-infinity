import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-08-27.basil',
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("Usuário não autenticado");

    const { plan, period, userId } = await req.json();

    if (!plan || !period || !userId) {
      throw new Error('Parâmetros inválidos');
    }

    // Mapeamento de preços por plano e período
    const priceIds: Record<string, Record<string, string>> = {
      functional: {
        monthly: 'price_1SPVszCJNzE5MXKSCNhy9L6u',
        semiannual: 'price_1SPc00CJNzE5MXKSeNkjVvEE',
        annual: 'price_1SPc0JCJNzE5MXKSXNf8Hoqp',
      },
      growth: {
        monthly: 'price_1SPVf1CJNzE5MXKShs5cCdHG',
        semiannual: 'price_1SPc0VCJNzE5MXKS45YJfZY3',
        annual: 'price_1SPc1GCJNzE5MXKSOSuh3Kqi',
      },
      infinity: {
        monthly: 'price_1SPVtvCJNzE5MXKSxRhoAdZG',
        semiannual: 'price_1SPc1aCJNzE5MXKS72KhVbII',
        annual: 'price_1SPc29CJNzE5MXKSekeXap7w',
      },
    };

    const priceId = priceIds[plan as keyof typeof priceIds]?.[period];
    if (!priceId) {
      throw new Error('Plano ou período inválido');
    }

    // Buscar ou criar customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${req.headers.get('origin')}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get('origin')}/pricing?checkout=cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
        period,
      },
    });

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
