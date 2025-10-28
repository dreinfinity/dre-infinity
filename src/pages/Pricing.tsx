import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription, PLAN_FEATURES, SubscriptionPlan } from "@/hooks/useSubscription";

export default function Pricing() {
  const navigate = useNavigate();
  const { currentPlan, upgradePlan, upgrading, isTrial, daysUntilExpiry } = useSubscription();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    
    // Por enquanto apenas atualiza o plano
    // Futuramente será integrado com Stripe
    upgradePlan(plan);
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

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold">
            <GradientText>Escolha seu Plano</GradientText>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece com 14 dias grátis. Cancele quando quiser.
          </p>
          
          {isTrial && (
            <Badge variant="outline" className="text-primary border-primary">
              Você tem {Math.ceil(daysUntilExpiry)} dias restantes no trial
            </Badge>
          )}
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
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-primary">
                          {planInfo.price.split(" ")[1]}
                        </span>
                        <span className="text-lg text-muted-foreground">/mês</span>
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
                    disabled={isCurrentPlan || upgrading}
                    className={`w-full ${
                      isRecommended
                        ? "bg-gradient-primary hover:opacity-90"
                        : ""
                    }`}
                    variant={isRecommended ? "default" : "outline"}
                    size="lg"
                  >
                    {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
                  </Button>

                  {!isCurrentPlan && (
                    <p className="text-xs text-center text-muted-foreground">
                      14 dias grátis • Sem compromisso
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
              <h3 className="font-semibold mb-2">Como funciona o trial de 14 dias?</h3>
              <p className="text-sm text-muted-foreground">
                Você tem acesso completo ao plano escolhido por 14 dias gratuitamente. 
                Após o período de trial, sua assinatura será automaticamente ativada e cobrada mensalmente.
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
                Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                O valor será ajustado proporcionalmente ao tempo restante do seu período atual.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold mb-2">Qual forma de pagamento é aceita?</h3>
              <p className="text-sm text-muted-foreground">
                Aceitamos todos os principais cartões de crédito através do Stripe, 
                uma plataforma de pagamentos segura e confiável.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
