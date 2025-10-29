import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
      discount = 0.05; // 5% desconto
      intervalCount = 6;
    } else if (period === 'annual') {
      discount = 0.10; // 10% desconto
      intervalCount = 12;
    }

    const pricePerMonth = basePrice * (1 - discount);
    const totalAmount = Math.round(pricePerMonth * intervalCount * 100); // em centavos

    // Criar produto no Stripe (ou buscar existente)
    const products = await stripe.products.search({
      query: `metadata['plan']:'${plan}'`,
    });

    let product;
    if (products.data.length > 0) {
      product = products.data[0];
    } else {
      product = await stripe.products.create({
        name: `DRE Infinity - ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
