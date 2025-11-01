import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSubscription, PLAN_FEATURES, BillingPeriod, SubscriptionPlan } from "@/hooks/useSubscription";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckoutSession, creatingCheckout, currentPlan, daysUntilExpiry, isTrial } = useSubscription();
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, BillingPeriod>>({
    functional: "monthly",
    growth: "monthly",
    infinity: "monthly",
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (user) {
      // Se logado, vai para checkout
      navigate(`/checkout?plan=${plan}`);
    } else {
      // Se não logado, vai para cadastro
      navigate(`/signup?plan=${plan}`);
    }
  };

  const getDiscountLabel = (period: BillingPeriod) => {
    if (period === "semiannual") return "7% OFF";
    if (period === "annual") return "15% OFF";
    return null;
  };

  const setPeriodForPlan = (plan: string, period: BillingPeriod) => {
    setSelectedPeriods(prev => ({ ...prev, [plan]: period }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          {isTrial && (
            <div className="text-sm text-muted-foreground">
              {daysUntilExpiry} dias restantes no trial
            </div>
          )}
        </div>

        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            <GradientText>Escolha seu Plano</GradientText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece com 7 dias grátis. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {(Object.keys(PLAN_FEATURES) as SubscriptionPlan[]).map((plan) => {
            const isCurrentPlan = currentPlan === plan;
            const isPopular = plan === "growth";
            const selectedPeriod = selectedPeriods[plan];

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
                  <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                    {PLAN_FEATURES[plan].name}
                  </h3>
                  
                  <div className="flex gap-2 mb-6 justify-center">
                    <Button
                      type="button"
                      variant={selectedPeriod === "monthly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPeriodForPlan(plan, "monthly")}
                      className="flex-1"
                    >
                      Mensal
                    </Button>
                    <Button
                      type="button"
                      variant={selectedPeriod === "semiannual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPeriodForPlan(plan, "semiannual")}
                      className="flex-1"
                    >
                      Semestral
                    </Button>
                    <Button
                      type="button"
                      variant={selectedPeriod === "annual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPeriodForPlan(plan, "annual")}
                      className="flex-1"
                    >
                      Anual
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="text-4xl font-bold">
                      <GradientText>
                        R$ {PLAN_FEATURES[plan].pricing[selectedPeriod]}/mês
                      </GradientText>
                    </div>
                    {selectedPeriod !== "monthly" && (
                      <div className="text-sm text-green-500 font-semibold mt-2">
                        {selectedPeriod === "semiannual" ? "7% de desconto" : "15% de desconto"}
                      </div>
                    )}
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
                  disabled={isCurrentPlan}
                  variant={isPopular ? "glow" : "outline"}
                  className="w-full"
                >
                  {isCurrentPlan ? "Plano Atual" : "Selecionar"}
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
              <h3 className="font-semibold mb-2">Como funciona o trial de 7 dias?</h3>
              <p className="text-sm text-muted-foreground">
                Você tem acesso completo ao plano escolhido por 7 dias gratuitamente, sem precisar cadastrar cartão. 
                Após o período de trial, você escolhe a forma de pagamento para continuar usando a plataforma.
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
                Você pode fazer upgrade do seu plano a qualquer momento pagando a diferença proporcional do valor sem desconto. 
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
