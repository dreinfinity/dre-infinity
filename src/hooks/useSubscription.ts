import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionPlan = "functional" | "growth" | "infinity";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";
export type BillingPeriod = "monthly" | "semiannual" | "annual";

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isActive: boolean;
  isTrial: boolean;
  daysUntilExpiry: number;
}

export interface PlanPricing {
  monthly: number;
  semiannual: number;
  annual: number;
}

export const PLAN_FEATURES = {
  functional: {
    name: "Functional",
    pricing: {
      monthly: 97,
      semiannual: 92.15, // 5% desconto
      annual: 87.30, // 10% desconto
    },
    features: [
      "Dashboard completo com KPIs essenciais",
      "Lançamentos ilimitados de transações",
      "Relatórios DRE básicos automatizados",
      "1 empresa cadastrada",
      "Exportação de relatórios (10/mês)",
      "Suporte por email",
    ],
    limits: {
      companies: 1,
      transactions: null,
      exports: 10,
    },
  },
  growth: {
    name: "Growth",
    pricing: {
      monthly: 197,
      semiannual: 187.15, // 5% desconto
      annual: 177.30, // 10% desconto
    },
    features: [
      "Tudo do Functional +",
      "Metas e planejamento orçamentário",
      "Análise horizontal e vertical completa",
      "Break-even e simulação de cenários",
      "Exportação Excel ilimitada",
      "Até 3 empresas gerenciadas",
      "Módulo de Gestão de Clientes",
      "Suporte prioritário",
    ],
    limits: {
      companies: 3,
      transactions: null,
      exports: null,
    },
  },
  infinity: {
    name: "Infinity",
    pricing: {
      monthly: 397,
      semiannual: 377.15, // 5% desconto
      annual: 357.30, // 10% desconto
    },
    features: [
      "Tudo do Growth +",
      "Empresas ilimitadas",
      "Módulo Caixa completo com cofres virtuais",
      "Dashboard avançado com métricas personalizadas",
      "Análise de CAC, LTV e ROI detalhada",
      "API de integração disponível",
      "Relatórios personalizados ilimitados",
      "Exportação em múltiplos formatos",
      "Suporte 24/7 com prioridade máxima",
      "Consultoria financeira mensal inclusa",
    ],
    limits: {
      companies: null,
      transactions: null,
      exports: null,
    },
  },
};

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc("get_subscription_details", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data as unknown as SubscriptionDetails;
    },
    enabled: !!user?.id,
  });

  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    if (!user?.id) return false;

    const { data, error } = await supabase.rpc("check_feature_access", {
      p_user_id: user.id,
      p_feature: feature,
    });

    if (error) {
      console.error("Error checking feature access:", error);
      return false;
    }

    return data || false;
  };

  const createCheckoutSession = useMutation({
    mutationFn: async ({ plan, period }: { plan: SubscriptionPlan; period: BillingPeriod }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          plan,
          period,
          userId: user.id,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("URL de checkout não gerada");

      // Redirecionar para checkout do Stripe
      window.location.href = data.url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast({
        title: "Plano atualizado!",
        description: "Seu plano foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPlanInfo = (plan?: SubscriptionPlan) => {
    if (!plan) return PLAN_FEATURES.functional;
    return PLAN_FEATURES[plan] || PLAN_FEATURES.functional;
  };

  return {
    subscription,
    isLoading,
    checkFeatureAccess,
    createCheckoutSession: createCheckoutSession.mutate,
    creatingCheckout: createCheckoutSession.isPending,
    getPlanInfo,
    currentPlan: subscription?.plan || "functional",
    isActive: subscription?.isActive || false,
    isTrial: subscription?.isTrial || false,
    daysUntilExpiry: subscription?.daysUntilExpiry || 0,
  };
}
