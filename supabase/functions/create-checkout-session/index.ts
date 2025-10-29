import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      apiVersion: '2023-10-16',
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

    // Preços base mensais
    const basePrices: Record<string, number> = {
      functional: 97,
      growth: 197,
      infinity: 397,
    };

    const basePrice = basePrices[plan as keyof typeof basePrices];
    if (!basePrice) {
      throw new Error('Plano inválido');
    }

    // Calcular desconto
    let discount = 0;
    let intervalCount = 1;
    
    if (period === 'semiannual') {
      discount = 0.05;
      intervalCount = 6;
    } else if (period === 'annual') {
      discount = 0.10;
      intervalCount = 12;
    }

    const pricePerMonth = basePrice * (1 - discount);

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

    // Buscar ou criar produto
    const productName = `DRE Infinity - ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
    const products = await stripe.products.search({
      query: `metadata['plan']:'${plan}'`,
    });

    let product;
    if (products.data.length > 0) {
      product = products.data[0];
    } else {
      product = await stripe.products.create({
        name: productName,
        metadata: { plan },
      });
    }

    // Criar preço
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(pricePerMonth * 100),
      currency: 'brl',
      recurring: {
        interval: 'month',
        interval_count: intervalCount,
      },
      metadata: {
        plan,
        period,
        discount: discount.toString(),
      },
    });

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
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
