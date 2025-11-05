import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Navigate } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanFeatureGuardProps {
  children: ReactNode;
  feature: "goals" | "scenarios" | "break-even" | "cash" | "clients";
  fallback?: ReactNode;
}

const featureRequirements = {
  goals: "growth",
  scenarios: "growth",
  "break-even": "growth",
  clients: "growth",
  cash: "infinity",
} as const;

export function PlanFeatureGuard({ children, feature, fallback }: PlanFeatureGuardProps) {
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();

  const requiredPlan = featureRequirements[feature];
  const planHierarchy = { functional: 1, growth: 2, infinity: 3 };

  const hasAccess = planHierarchy[currentPlan as keyof typeof planHierarchy] >= planHierarchy[requiredPlan];

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container max-w-4xl mx-auto p-6">
        <GlassCard className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">
              <GradientText>Recurso Premium</GradientText>
            </h2>
            <p className="text-muted-foreground">
              Este recurso está disponível apenas no plano {requiredPlan === "growth" ? "Growth" : "Infinity"} ou superior.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/pricing")}
              variant="glow"
              size="lg"
            >
              Fazer Upgrade
            </Button>
            <div>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
