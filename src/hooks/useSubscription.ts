import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionPlan = "functional" | "growth" | "infinity";
export type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired";

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

export const PLAN_FEATURES = {
  functional: {
    name: "Functional",
    price: "R$ 97",
    monthlyPrice: 97,
    features: [
      "Dashboard completo",
      "Lançamentos ilimitados",
      "Relatórios DRE básicos",
      "1 empresa",
      "Suporte por email",
    ],
    limits: {
      companies: 1,
      transactions: null, // ilimitado
      exports: 10, // por mês
    },
  },
  growth: {
    name: "Growth",
    price: "R$ 197",
    monthlyPrice: 197,
    features: [
      "Tudo do Functional +",
      "Metas e orçamento",
      "Análise horizontal",
      "Break-even e cenários",
      "Exportação Excel ilimitada",
      "Até 3 empresas",
      "Suporte prioritário",
    ],
    limits: {
      companies: 3,
      transactions: null,
      exports: null, // ilimitado
    },
  },
  infinity: {
    name: "Infinity",
    price: "R$ 397",
    monthlyPrice: 397,
    features: [
      "Tudo do Growth +",
      "Empresas ilimitadas",
      "Módulo Caixa completo",
      "API de integração",
      "Relatórios personalizados",
      "Suporte 24/7 prioritário",
      "Consultoria mensal inclusa",
    ],
    limits: {
      companies: null, // ilimitado
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

  const upgradePlan = useMutation({
    mutationFn: async (newPlan: SubscriptionPlan) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Aqui será integrado o Stripe no futuro
      // Por enquanto, apenas atualiza o plano localmente
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan: newPlan,
          status: "active" as SubscriptionStatus,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
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
    upgradePlan: upgradePlan.mutate,
    upgrading: upgradePlan.isPending,
    getPlanInfo,
    currentPlan: subscription?.plan || "functional",
    isActive: subscription?.isActive || false,
    isTrial: subscription?.isTrial || false,
    daysUntilExpiry: subscription?.daysUntilExpiry || 0,
  };
}
