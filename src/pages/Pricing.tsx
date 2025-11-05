import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { useSubscription, PLAN_FEATURES, SubscriptionPlan, BillingPeriod } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentPlan, daysUntilExpiry, isTrial } = useSubscription();
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>("monthly");

  const { createCheckoutSession, creatingCheckout } = useSubscription();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (user) {
      // Se logado, cria sessão de checkout direto no Stripe
      createCheckoutSession({ plan, period: selectedPeriod });
    } else {
      // Se não logado, vai para cadastro
      navigate(`/signup?plan=${plan}&period=${selectedPeriod}`);
    }
  };

  const handleBack = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const getPriceDisplay = (plan: SubscriptionPlan) => {
    const pricing = PLAN_FEATURES[plan].pricing;
    
    switch (selectedPeriod) {
      case "semiannual":
        return {
          total: pricing.semiannual,
          monthly: pricing.semiannualMonthly,
          discount: "8% de desconto",
        };
      case "annual":
        return {
          total: pricing.annual,
          monthly: pricing.annualMonthly,
          discount: "18% de desconto",
        };
      default:
        return {
          total: pricing.monthly,
          monthly: pricing.monthly,
          discount: null,
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            {isTrial && (
              <div className="text-sm text-muted-foreground">
                Teste Grátis - Faltam {daysUntilExpiry} dias
              </div>
            )}
            {user && (
              <Button
                variant="ghost"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
          </div>
        </div>

        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            <GradientText>Escolha seu Plano</GradientText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece com 7 dias grátis. Sem necessidade de cartão. Cancele quando quiser.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-muted/30 rounded-lg p-1 gap-1">
            <Button
              variant={selectedPeriod === "monthly" ? "default" : "ghost"}
              onClick={() => setSelectedPeriod("monthly")}
              className="rounded-md"
            >
              Mensal
            </Button>
            <Button
              variant={selectedPeriod === "semiannual" ? "default" : "ghost"}
              onClick={() => setSelectedPeriod("semiannual")}
              className="rounded-md"
            >
              Semestral
              <span className="ml-2 text-xs text-green-500">-8%</span>
            </Button>
            <Button
              variant={selectedPeriod === "annual" ? "default" : "ghost"}
              onClick={() => setSelectedPeriod("annual")}
              className="rounded-md"
            >
              Anual
              <span className="ml-2 text-xs text-green-500">-18%</span>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {(Object.keys(PLAN_FEATURES) as SubscriptionPlan[]).map((plan) => {
            const isCurrentPlan = currentPlan === plan;
            const isPopular = plan === "growth";
            const priceDisplay = getPriceDisplay(plan);

            return (
              <GlassCard
                key={plan}
                className={`relative p-8 ${
                  isPopular ? "border-2 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : ""
                }`}
                style={isPopular ? {
                  borderImage: "linear-gradient(135deg, rgb(34, 197, 94), rgb(59, 130, 246)) 1"
                } : undefined}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                    {PLAN_FEATURES[plan].name}
                  </h3>
                   
                  <div className="mb-4">
                    <div className="text-4xl font-bold">
                      <GradientText>
                        R$ {priceDisplay.monthly}/mês
                      </GradientText>
                    </div>
                    {priceDisplay.discount && (
                      <div className="text-sm text-green-500 font-medium mt-1">
                        {priceDisplay.discount}
                      </div>
                    )}
                    {selectedPeriod !== "monthly" && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Total: R$ {priceDisplay.total}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      7 dias grátis - Sem cartão
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {PLAN_FEATURES[plan].features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan || creatingCheckout}
                  variant={isPopular ? "glow" : "outline"}
                  className="w-full"
                >
                  {creatingCheckout ? "Processando..." : isCurrentPlan ? "Plano Atual" : "Começar Teste Grátis"}
                </Button>
              </GlassCard>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            <GradientText>Perguntas Frequentes</GradientText>
          </h2>
          
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Como funciona o teste grátis de 7 dias?</h3>
              <p className="text-sm text-muted-foreground">
                Você tem acesso completo ao plano escolhido por 7 dias gratuitamente, sem precisar cadastrar cartão. 
                Após o período de teste, você pode escolher continuar com o plano pagando via cartão de crédito.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. 
                Seu acesso continuará até o final do período pago.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Como funciona a mudança de plano?</h3>
              <p className="text-sm text-muted-foreground">
                Você pode fazer upgrade do seu plano a qualquer momento pagando a diferença proporcional. 
                Também pode agendar a mudança para a próxima renovação automática.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Qual forma de pagamento é aceita?</h3>
              <p className="text-sm text-muted-foreground">
                Aceitamos todos os principais cartões de crédito através do Stripe, 
                uma plataforma de pagamentos segura e confiável usada por milhões de empresas.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
