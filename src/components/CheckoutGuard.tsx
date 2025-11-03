import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { GradientText } from "./GradientText";
import { Button } from "./ui/button";

export function CheckoutGuard({ children }: { children: React.ReactNode }) {
  const { subscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && subscription) {
      // Se não está ativo e não está em trial, redirecionar para pricing
      if (!subscription.isActive && !subscription.isTrial) {
        if (location.pathname !== '/pricing') {
          navigate('/pricing');
        }
      }
    }
  }, [subscription, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não está ativo e não está em trial, mostrar tela de checkout
  if (!subscription?.isActive && !subscription?.isTrial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GlassCard className="max-w-2xl w-full p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <GradientText>Seu Trial Expirou</GradientText>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Continue aproveitando todos os recursos da DRE Infinity escolhendo um plano agora.
            </p>
          </div>

          <div className="pt-6">
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-primary hover:opacity-90 text-lg px-8"
              size="lg"
            >
              Ver Planos e Preços
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Precisa sair?{" "}
            <button
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
            >
              Fazer logout
            </button>
          </p>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
