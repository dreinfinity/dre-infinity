import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSubscription, PLAN_FEATURES, SubscriptionPlan, BillingPeriod } from "@/hooks/useSubscription";

export default function Pricing() {
  const navigate = useNavigate();
  const { currentPlan, createCheckoutSession, creatingCheckout, isTrial, daysUntilExpiry } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    createCheckoutSession({ plan, period: billingPeriod });
  };

  const getDiscountBadge = () => {
    if (billingPeriod === "semiannual") return "5% OFF";
    if (billingPeriod === "annual") return "10% OFF";
    return null;
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "growth":
        return <Zap className="w-8 h-8" />;
      case "infinity":
        return <Crown className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "growth":
        return "from-emerald-500 to-teal-500";
      case "infinity":
        return "from-violet-500 to-purple-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            <GradientText>Escolha seu Plano</GradientText>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            7 dias grátis para testar. Cancele quando quiser.
          </p>
          
          {isTrial && (
            <Badge variant="outline" className="text-primary border-primary text-sm sm:text-base px-4 py-2">
              Você tem {Math.ceil(daysUntilExpiry)} dias restantes no trial
            </Badge>
          )}

          {/* Seletor de Período */}
          <div className="flex justify-center">
            <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}>
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="monthly" className="text-sm sm:text-base">Mensal</TabsTrigger>
                <TabsTrigger value="semiannual" className="text-sm sm:text-base relative">
                  Semestral
                  {billingPeriod === "semiannual" && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">5% OFF</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="annual" className="text-sm sm:text-base relative">
                  Anual
                  {billingPeriod === "annual" && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">10% OFF</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {Object.entries(PLAN_FEATURES).map(([planKey, planInfo]) => {
            const plan = planKey as SubscriptionPlan;
            const isCurrentPlan = currentPlan === plan;
            const isRecommended = plan === "growth";

            return (
              <GlassCard
                key={plan}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isRecommended ? "ring-2 ring-primary scale-105" : ""
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    MAIS POPULAR
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-success text-white px-4 py-1 text-xs font-semibold rounded-br-lg">
                    SEU PLANO ATUAL
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Ícone e Nome */}
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getPlanColor(plan)} w-fit`}>
                      <div className="text-white">
                        {getPlanIcon(plan)}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{planInfo.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-bold text-primary">
                            R$ {planInfo.pricing[billingPeriod].toFixed(2)}
                          </span>
                          <span className="text-base sm:text-lg text-muted-foreground">/mês</span>
                        </div>
                        {billingPeriod !== "monthly" && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Cobrança {billingPeriod === "semiannual" ? "semestral" : "anual"} • {getDiscountBadge()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {planInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan || creatingCheckout}
                    className={`w-full text-base sm:text-lg ${
                      isRecommended
                        ? "bg-gradient-primary hover:opacity-90"
                        : ""
                    }`}
                    variant={isRecommended ? "default" : "outline"}
                    size="lg"
                  >
                    {isCurrentPlan ? "Plano Atual" : creatingCheckout ? "Processando..." : "Selecionar Plano"}
                  </Button>

                  {!isCurrentPlan && (
                    <p className="text-xs sm:text-sm text-center text-muted-foreground">
                      7 dias grátis • Cancele quando quiser
                    </p>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            <GradientText>Perguntas Frequentes</GradientText>
          </h2>
          
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Como funciona o trial de 7 dias?</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Você tem acesso completo ao plano Functional por 7 dias gratuitamente, sem precisar cadastrar cartão. 
                Após o período de trial, você escolhe seu plano e forma de pagamento para continuar usando a plataforma.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Posso cancelar a qualquer momento?</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. 
                Seu acesso continuará até o final do período pago.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Como funciona a mudança de plano?</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Você pode fazer upgrade do seu plano a qualquer momento pagando apenas a diferença proporcional. 
                Também pode agendar a mudança para a próxima renovação sem custos adicionais.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Qual forma de pagamento é aceita?</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
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
