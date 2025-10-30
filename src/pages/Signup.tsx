import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PLAN_FEATURES, SubscriptionPlan } from "@/hooks/useSubscription";

export default function Signup() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPlan = (searchParams.get("plan") || "functional") as SubscriptionPlan;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Criar conta
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar subscription com trial de 7 dias
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        const { error: subError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: authData.user.id,
            plan: selectedPlan,
            status: "trial",
            trial_ends_at: trialEnd.toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: trialEnd.toISOString(),
          });

        if (subError) {
          console.error("Erro ao criar subscription:", subError);
        }
      }

      toast({
        title: "Cadastro realizado!",
        description: "Seu período de teste de 7 dias começou. Faça login para continuar.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText sparkle>DRE INFINITY</GradientText>
          </h1>
          <p className="text-muted-foreground">Crie sua conta e teste grátis por 7 dias</p>
        </div>

        <GlassCard className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold mb-4 block">Escolha seu Plano</Label>
                <RadioGroup
                  value={selectedPlan}
                  onValueChange={(value) => setSelectedPlan(value as SubscriptionPlan)}
                  className="space-y-3"
                >
                  {(Object.keys(PLAN_FEATURES) as SubscriptionPlan[]).map((plan) => (
                    <div
                      key={plan}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <RadioGroupItem value={plan} id={plan} />
                      <Label htmlFor={plan} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold capitalize">{PLAN_FEATURES[plan].name}</span>
                            {plan === "growth" && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                MAIS POPULAR
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-bold">
                            R$ {PLAN_FEATURES[plan].pricing.monthly}
                            <span className="text-sm text-muted-foreground">/mês</span>
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              variant="glow"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Começar Teste Grátis de 7 Dias"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              Já tem uma conta? Faça login
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              ← Voltar para o início
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
