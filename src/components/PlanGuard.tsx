import { ReactNode } from "react";
import { useSubscription, SubscriptionPlan } from "@/hooks/useSubscription";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface PlanGuardProps {
  children: ReactNode;
  requiredPlan: SubscriptionPlan;
  fallback?: ReactNode;
}

const planHierarchy: Record<SubscriptionPlan, number> = {
  functional: 1,
  growth: 2,
  infinity: 3,
};

export function PlanGuard({ children, requiredPlan, fallback }: PlanGuardProps) {
  const { subscription, isLoading, currentPlan } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Verifica se o plano atual atende ao requisito
  const currentPlanLevel = planHierarchy[currentPlan];
  const requiredPlanLevel = planHierarchy[requiredPlan];

  if (currentPlanLevel < requiredPlanLevel) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/pricing" replace />;
  }

  // Verifica se a assinatura está ativa ou em trial
  if (!subscription?.isActive && !subscription?.isTrial) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
