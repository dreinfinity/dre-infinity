import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Navbar } from "@/components/Navbar";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Crown,
  Wallet,
  LineChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { PLAN_FEATURES } from "@/hooks/useSubscription";
import heroBg from "@/assets/hero-bg.jpg";

export default function Landing() {
  const features = [
    {
      icon: BarChart3,
      title: "DRE Automatizada Inteligente",
      description: "Transforme seus dados em relatórios profissionais de DRE com análise vertical e horizontal, economizando horas de trabalho manual."
    },
    {
      icon: TrendingUp,
      title: "Dashboard de Alto Impacto",
      description: "Tome decisões baseadas em dados reais com visualizações de KPIs, margens, CAC, LTV e ROI em tempo real."
    },
    {
      icon: Target,
      title: "Análise de Break-Even",
      description: "Descubra exatamente quanto precisa vender para cobrir custos e planeje seu crescimento com margem de segurança calculada automaticamente."
    },
    {
      icon: Zap,
      title: "Simulações Avançadas",
      description: "Preveja o futuro do seu negócio testando diferentes cenários antes de investir ou tomar decisões críticas."
    },
    {
      icon: Wallet,
      title: "Gestão de Caixa Completa",
      description: "Controle total do fluxo de caixa com cofres virtuais para reserva de emergência, capital de giro e investimentos."
    },
    {
      icon: LineChart,
      title: "Métricas que Impulsionam Vendas",
      description: "Acompanhe ticket médio, taxa de conversão e retenção de clientes para maximizar sua receita."
    },
    {
      icon: Shield,
      title: "Segurança Empresarial",
      description: "Proteção de nível bancário para seus dados financeiros com backup automático e criptografia avançada."
    },
    {
      icon: Sparkles,
      title: "Experiência Premium",
      description: "Interface moderna e intuitiva que torna a gestão financeira profissional acessível para qualquer empresa."
    }
  ];

  const benefits = [
    "Reduza em 90% o tempo gasto com análise financeira",
    "Aumente sua margem de lucro identificando desperdícios",
    "Tome decisões seguras baseadas em dados reais",
    "Escale seu negócio com planejamento financeiro sólido",
    "Tenha visibilidade total da saúde financeira 24/7"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 grid-background opacity-30" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">Gestão Financeira Inteligente</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <GradientText sparkle>
                DRE Automatizada
              </GradientText>
              <br />
              <span className="text-foreground">para Seu Negócio</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma completa de Demonstração de Resultado do Exercício com 
              dashboard interativo, análises avançadas e simulações em tempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/signup">
                  Experimentar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" className="text-lg px-8" asChild>
                <Link to="/login">
                  Fazer Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText>Recursos Poderosos</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para uma gestão financeira profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <GlassCard 
                key={index}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold gradient-text">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <GradientText>Por que escolher a DRE INFINITY?</GradientText>
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Transforme dados financeiros em insights estratégicos com a plataforma 
                    mais moderna e intuitiva do mercado.
                  </p>
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">
                      Começar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 relative" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText>Planos e Preços</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              7 dias grátis para testar. Escolha o plano ideal para seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {Object.entries(PLAN_FEATURES).map(([planKey, planInfo]) => {
              const isPopular = planKey === 'growth';
              
              return (
                <GlassCard
                  key={planKey}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isPopular ? 'ring-2 ring-primary scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                      MAIS POPULAR
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${
                        planKey === 'growth' ? 'from-emerald-500 to-teal-500' :
                        planKey === 'infinity' ? 'from-violet-500 to-purple-500' :
                        'from-blue-500 to-cyan-500'
                      } w-fit`}>
                        <div className="text-white">
                          {planKey === 'growth' ? <Zap className="w-8 h-8" /> :
                           planKey === 'infinity' ? <Crown className="w-8 h-8" /> :
                           <Sparkles className="w-8 h-8" />}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{planInfo.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-primary">
                            R$ {planInfo.pricing.monthly.toFixed(2)}
                          </span>
                          <span className="text-lg text-muted-foreground">/mês</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          7 dias grátis • Cancele quando quiser
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {planInfo.features.slice(0, 6).map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={`w-full ${
                        isPopular ? 'bg-gradient-primary hover:opacity-90' : ''
                      }`}
                      variant={isPopular ? 'default' : 'outline'}
                      size="lg"
                    >
                      <Link to={`/signup?plan=${planKey}`}>
                        Começar Agora
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <GradientText>Pronto para Transformar</GradientText>
              <br />
              <span className="text-foreground">Sua Gestão Financeira?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece agora com 7 dias grátis. Sem cadastro de cartão. Cancele quando quiser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/signup">
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" className="text-lg px-8" asChild>
                <a href="#planos">Ver Planos</a>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Dias Grátis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Seguro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Suporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">
                <GradientText>DRE INFINITY</GradientText>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 DRE INFINITY. Gestão financeira profissional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
