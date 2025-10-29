import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Erro ao verificar webhook:', err);
        return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    } else {
      event = JSON.parse(body);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processando evento Stripe:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const period = session.metadata?.period;

        if (!userId || !plan) {
          console.error('Metadados inválidos no checkout session');
          break;
        }

        // Atualizar assinatura
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (period === 'annual' ? 365 : period === 'semiannual' ? 180 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            trial_ends_at: null,
          });

        console.log('Assinatura ativada para usuário:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar usuário pelo customer_id
        const { data: userData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!userData) {
          console.error('Usuário não encontrado para customer:', customerId);
          break;
        }

        // Atualizar status da assinatura
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'cancelled' : 'expired',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Assinatura atualizada:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Assinatura cancelada:', subscription.id);
        break;
      }

      default:
        console.log('Evento não tratado:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
