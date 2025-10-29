import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PLAN_FEATURES, SubscriptionPlan } from "@/hooks/useSubscription";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  currentPlan?: SubscriptionPlan;
}

export function UpgradeModal({ open, onOpenChange, feature, currentPlan = "functional" }: UpgradeModalProps) {
  const navigate = useNavigate();

  const getRecommendedPlan = (): SubscriptionPlan => {
    if (currentPlan === "functional") return "growth";
    if (currentPlan === "growth") return "infinity";
    return "infinity";
  };

  const recommendedPlan = getRecommendedPlan();
  const planInfo = PLAN_FEATURES[recommendedPlan];

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "growth":
        return <Zap className="w-6 h-6" />;
      case "infinity":
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            <GradientText>Desbloqueie Todo o Potencial</GradientText>
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {feature 
              ? `Para acessar "${feature}", você precisa fazer upgrade do seu plano.`
              : "Upgrade seu plano e tenha acesso a recursos avançados."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plano Recomendado */}
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
              RECOMENDADO
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {getPlanIcon(recommendedPlan)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{planInfo.name}</h3>
                  <p className="text-3xl font-bold text-primary">
                    R$ {planInfo.pricing.monthly.toFixed(2)}
                    <span className="text-sm text-muted-foreground font-normal">/mês</span>
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {planInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fazer Upgrade Agora
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  14 dias grátis • Cancele quando quiser
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Benefícios do Upgrade */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-card/50">
              <div className="text-2xl font-bold text-primary">Ilimitado</div>
              <div className="text-xs text-muted-foreground">Lançamentos</div>
            </div>
            <div className="p-3 rounded-lg bg-card/50">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-xs text-muted-foreground">Suporte</div>
            </div>
            <div className="p-3 rounded-lg bg-card/50">
              <div className="text-2xl font-bold text-primary">Seguro</div>
              <div className="text-xs text-muted-foreground">Stripe</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
