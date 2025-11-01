import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, PLAN_FEATURES, SubscriptionPlan, BillingPeriod } from "@/hooks/useSubscription";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createCheckoutSession, creatingCheckout } = useSubscription();
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>("monthly");

  const plan = (searchParams.get("plan") || "functional") as SubscriptionPlan;
  const planInfo = PLAN_FEATURES[plan];

  useEffect(() => {
    if (!user) {
      navigate(`/signup?plan=${plan}`);
    }
  }, [user, navigate, plan]);

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para continuar.",
        variant: "destructive",
      });
      navigate(`/signup?plan=${plan}`);
      return;
    }

    createCheckoutSession({ plan, period: selectedPeriod });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const price = planInfo.pricing[selectedPeriod];
  const savings = selectedPeriod === "semiannual" ? 7 : selectedPeriod === "annual" ? 15 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <GradientText className="text-4xl font-bold mb-4">
            Finalizar Assinatura
          </GradientText>
          <p className="text-muted-foreground">
            Complete sua assinatura e comece a usar todas as funcionalidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumo do Plano */}
          <GlassCard className="p-6 h-fit">
            <h3 className="text-2xl font-bold mb-4">
              <GradientText>Plano {planInfo.name}</GradientText>
            </h3>
            
            <div className="space-y-4 mb-6">
              {planInfo.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Pagamento */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-6">Período de Cobrança</h3>

            {/* Seletor de Período */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedPeriod === "monthly" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedPeriod("monthly")}
              >
                Mensal
              </Button>
              <Button
                variant={selectedPeriod === "semiannual" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedPeriod("semiannual")}
              >
                Semestral
                {selectedPeriod === "semiannual" && (
                  <span className="ml-1 text-xs">-7%</span>
                )}
              </Button>
              <Button
                variant={selectedPeriod === "annual" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedPeriod("annual")}
              >
                Anual
                {selectedPeriod === "annual" && (
                  <span className="ml-1 text-xs">-15%</span>
                )}
              </Button>
            </div>

            {/* Resumo do Preço */}
            <div className="bg-background/50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano {planInfo.name}</span>
                <span className="font-medium">R$ {price}/mês</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Economia</span>
                  <span className="text-green-500 font-medium">{savings}% de desconto</span>
                </div>
              )}

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    R$ {price * (selectedPeriod === "monthly" ? 1 : selectedPeriod === "semiannual" ? 6 : 12)}
                    <span className="text-sm text-muted-foreground">
                      /{selectedPeriod === "monthly" ? "mês" : selectedPeriod === "semiannual" ? "semestre" : "ano"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Pagamento */}
            <Button
              onClick={handleCheckout}
              disabled={creatingCheckout}
              className="w-full"
              size="lg"
            >
              {creatingCheckout ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Ir para Pagamento"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Você será redirecionado para o checkout seguro do Stripe
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
