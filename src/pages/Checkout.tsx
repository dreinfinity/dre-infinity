import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, PLAN_FEATURES, SubscriptionPlan } from "@/hooks/useSubscription";
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

    createCheckoutSession({ plan });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const price = planInfo.pricing.monthly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <GradientText className="text-4xl font-bold mb-4">
            Finalizar Assinatura
          </GradientText>
          <p className="text-muted-foreground">
            7 dias grátis, depois R$ {price}/mês. Cancele quando quiser.
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
            <h3 className="text-xl font-semibold mb-6">Detalhes da Assinatura</h3>

            {/* Resumo do Preço */}
            <div className="bg-background/50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plano {planInfo.name}</span>
                <span className="font-medium">R$ {price}/mês</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-green-500 font-medium">Trial gratuito</span>
                <span className="text-green-500 font-medium">7 dias</span>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Hoje</span>
                  <span className="font-bold text-lg text-green-500">Grátis</span>
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Após o trial</span>
                  <span>R$ {price}/mês</span>
                </div>
              </div>
            </div>

            {/* Botão de Pagamento */}
            <Button
              onClick={handleCheckout}
              disabled={creatingCheckout}
              className="w-full bg-gradient-primary hover:opacity-90"
              size="lg"
            >
              {creatingCheckout ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Começar Teste Grátis"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Você será redirecionado para o checkout seguro do Stripe. Cancele a qualquer momento.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
