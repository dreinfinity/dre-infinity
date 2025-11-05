import { useCompany } from "@/contexts/CompanyContext";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CompanyLimitGuard() {
  const { companies } = useCompany();
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();

  const planLimits = PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES]?.limits;
  const companyLimit = planLimits?.companies;

  // Se o limite é null, significa ilimitado
  if (companyLimit === null) {
    return null;
  }

  // Se ainda não atingiu o limite, não mostra nada
  if (companies.length < companyLimit) {
    return null;
  }

  // Atingiu o limite
  return (
    <GlassCard className="p-6 border-2 border-yellow-500/50 bg-yellow-500/5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">
              <GradientText>Limite de Empresas Atingido</GradientText>
            </h3>
            <p className="text-sm text-muted-foreground">
              Você atingiu o limite de {companyLimit} {companyLimit === 1 ? "empresa" : "empresas"} do plano {PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES]?.name}.
              Faça upgrade para gerenciar mais empresas.
            </p>
          </div>
          <Button
            onClick={() => navigate("/pricing")}
            variant="outline"
            size="sm"
            className="border-yellow-500/50 hover:bg-yellow-500/10"
          >
            Fazer Upgrade
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
