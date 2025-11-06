import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, BookOpen, Calculator, TrendingUp, Play } from "lucide-react";
import { TourGuide } from "@/components/TourGuide";
import { DASHBOARD_TOUR } from "@/hooks/useTour";
export default function Help() {
  const [runTour, setRunTour] = useState(false);

  const handleStartTour = () => {
    setRunTour(true);
  };

  const handleCompleteTour = () => {
    setRunTour(false);
  };

  return (
    <DashboardLayout>
    <div className="space-y-6 animate-fade-in">
      <TourGuide run={runTour} steps={DASHBOARD_TOUR} onComplete={handleCompleteTour} />
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Central de Ajuda</GradientText>
          </h1>
          <p className="text-muted-foreground">Aprenda a usar o DRE Infinity e entenda suas métricas financeiras</p>
        </div>
        <Button onClick={handleStartTour} variant="glow" className="gap-2">
          <Play className="w-4 h-4" />
          Ver Tutorial
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-6 hover-scale">
          <BookOpen className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-xl font-semibold mb-2">
            <GradientText>Primeiros Passos</GradientText>
          </h3>
          <p className="text-sm text-muted-foreground">Configure sua empresa, depois cadastre categorias/clientes e outros em &quot;Configurações&quot; e comece a lançar transações para visualizar seus resultados automaticamente.</p>
        </GlassCard>

        <GlassCard className="p-6 hover-scale">
          <Calculator className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-xl font-semibold mb-2">
            <GradientText>Entenda seus Cálculos</GradientText>
          </h3>
          <p className="text-sm text-muted-foreground">
            Todas as métricas são calculadas automaticamente baseadas nas suas
            transações e configurações de impostos.
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            <GradientText>Perguntas Frequentes</GradientText>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>O que é CAC e como é calculado?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                <strong>CAC (Custo de Aquisição de Cliente)</strong> é quanto sua
                empresa gasta em média para conquistar um novo cliente.
              </p>
              <p className="mb-2">
                <strong>Fórmula:</strong> CAC = (Custos de Marketing + Custos de
                Vendas) / Número de Novos Clientes
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo:</strong> Se você gastou R$ 5.000 em marketing e
                R$ 3.000 em vendas, e conquistou 10 novos clientes, seu CAC é R$
                800 por cliente.
              </p>
              <p className="mt-2 text-sm">
                <strong>Como marcar:</strong> Ao cadastrar uma transação, ative o
                botão "Custo de Marketing/Vendas" para incluir no cálculo do CAC.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>O que é LTV e como é calculado?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                <strong>LTV (Lifetime Value)</strong> é o valor total que um
                cliente gera para sua empresa durante todo o relacionamento.
              </p>
              <p className="mb-2">
                <strong>Fórmula:</strong> LTV = Ticket Médio × 12 meses
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo:</strong> Se seu ticket médio é R$ 1.200, o LTV
                estimado é R$ 14.400 (assumindo retenção de 12 meses).
              </p>
              <p className="mt-2 text-sm">
                <strong>Meta Ideal:</strong> LTV deve ser pelo menos 3x maior que
                o CAC (LTV/CAC Ratio {'>'} 3:1).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              O que é Ponto de Equilíbrio (Break-Even)?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                <strong>Ponto de Equilíbrio</strong> é o valor de receita
                necessário para cobrir todos os custos fixos da empresa (ou seja,
                quando Lucro = 0).
              </p>
              <p className="mb-2">
                <strong>Fórmula:</strong> Break-Even = Custos Fixos / Taxa de
                Margem de Contribuição
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo:</strong> Se seus custos fixos são R$ 30.000 e sua
                margem de contribuição é 60%, você precisa faturar R$ 50.000 para
                empatar.
              </p>
              <p className="mt-2 text-sm">
                <strong>Interpretação:</strong> Qualquer receita acima do ponto de
                equilíbrio é lucro líquido para a empresa.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              Como configurar os impostos (DAS vs Impostos Individuais)?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Você pode configurar os impostos em{" "}
                <strong>Configurações {'>'} % AV</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <strong>DAS (Simples Nacional):</strong> Ative a opção "Usar
                  DAS" e defina a alíquota única (geralmente entre 4% e 15%
                  dependendo da faixa de faturamento).
                </li>
                <li>
                  <strong>Lucro Presumido/Real:</strong> Desative "Usar DAS" e
                  configure cada imposto individualmente (ICMS, IPI, PIS, COFINS,
                  ISS).
                </li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                Após configurar, clique em "Recalcular Métricas" na página de
                Debug para atualizar todos os cálculos.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>
              O que é Análise Horizontal (% AH)?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                <strong>Análise Horizontal</strong> compara os valores de um
                período com o período anterior, mostrando a variação percentual.
              </p>
              <p className="mb-2">
                <strong>Fórmula:</strong> % AH = ((Valor Atual - Valor Anterior) /
                Valor Anterior) × 100
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo:</strong> Se a Receita Bruta em outubro foi R$
                10.000 e em setembro foi R$ 8.000, a % AH é +25% (crescimento de
                25%).
              </p>
              <p className="mt-2 text-sm">
                <strong>Interpretação:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Valores positivos (+) indicam crescimento</li>
                  <li>Valores negativos (-) indicam redução</li>
                </ul>
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>
              Como usar o módulo de Cenários e Simulações?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                O módulo de <strong>Cenários</strong> permite simular o impacto de
                mudanças nas receitas ou custos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <strong>Simular Aumento de Receita:</strong> Ajuste o slider
                  para ver como um aumento de 10%, 20% ou 50% afetaria o lucro
                  líquido.
                </li>
                <li>
                  <strong>Simular Redução de Custos:</strong> Teste cenários de
                  otimização de custos para entender o impacto na margem.
                </li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                Use essa ferramenta para planejamento estratégico e tomada de
                decisões baseadas em dados.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>
              Dashboard vazio ou desatualizado. O que fazer?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Se o Dashboard não exibe dados após cadastrar transações, siga
                estes passos:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Acesse a página <strong>/debug-data</strong> (adicione manualmente
                  na URL)
                </li>
                <li>
                  Clique no botão{" "}
                  <strong>"🔄 Recalcular Métricas (Forçar)"</strong>
                </li>
                <li>
                  Aguarde alguns segundos para o sistema reprocessar todas as
                  transações
                </li>
                <li>Volte ao Dashboard e atualize a página</li>
              </ol>
              <p className="mt-2 text-sm text-muted-foreground">
                Isso forçará o recálculo de todas as métricas e atualizará o cache
                do sistema.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>
              O que é Markup e como calcular o Preço de Venda?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                <strong>Markup</strong> é um índice multiplicador usado para
                calcular o preço de venda de um produto/serviço, garantindo que
                todos os custos e a margem de lucro desejada sejam cobertos.
              </p>
              <p className="mb-2">
                <strong>Componentes do Markup:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm mb-2">
                <li>
                  <strong>CD (Custo Direto):</strong> Soma dos custos diretos
                  vinculados ao produto (matéria-prima, mão de obra direta, etc.)
                </li>
                <li>
                  <strong>DV% (Despesas Variáveis %):</strong> Percentual das
                  despesas variáveis em relação à receita líquida
                </li>
                <li>
                  <strong>DF% (Despesas Fixas %):</strong> Percentual das despesas
                  fixas em relação à receita líquida
                </li>
                <li>
                  <strong>ML% (Margem de Lucro %):</strong> Percentual de lucro
                  desejado sobre a venda
                </li>
              </ul>
              <p className="mb-2">
                <strong>Fórmulas:</strong>
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm mb-2">
                <p>
                  <strong>Índice Markup (Divisor):</strong>
                  <br />
                  Markup = 100 / [100 - (DV% + DF% + ML%)]
                </p>
                <p>
                  <strong>Preço de Venda:</strong>
                  <br />
                  Preço = Custo Direto × Markup
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Exemplo:</strong> Se seu Custo Direto é R$ 100, DV% = 10%,
                DF% = 20% e você deseja ML% = 30%:
                <br />
                Markup = 100 / [100 - (10 + 20 + 30)] = 100 / 40 = 2,50
                <br />
                Preço de Venda = R$ 100 × 2,50 = R$ 250,00
              </p>
              <p className="mt-2 text-sm">
                <strong>Como configurar:</strong> Acesse o Dashboard, role até a
                seção "Cálculo de Markup" e clique em "Configurar" para vincular
                suas categorias de custos/despesas aos tipos de Markup (CD, DV ou
                DF).
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            <GradientText>Glossário de Termos</GradientText>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-sm mb-1">Receita Bruta</h4>
            <p className="text-xs text-muted-foreground">
              Total de vendas antes de deduções e impostos
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Receita Líquida</h4>
            <p className="text-xs text-muted-foreground">
              Receita Bruta menos deduções e impostos
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">CMV</h4>
            <p className="text-xs text-muted-foreground">
              Custo de Mercadoria Vendida (custos diretos de produção)
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Lucro Bruto</h4>
            <p className="text-xs text-muted-foreground">
              Receita Líquida menos CMV
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">EBIT</h4>
            <p className="text-xs text-muted-foreground">
              Lucro Operacional (antes de juros e impostos)
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Lucro Líquido</h4>
            <p className="text-xs text-muted-foreground">
              Resultado final após todos os custos e impostos
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Margem de Contribuição</h4>
            <p className="text-xs text-muted-foreground">
              Receita Líquida menos Custos Variáveis
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">ROI</h4>
            <p className="text-xs text-muted-foreground">
              Retorno sobre Investimento (lucro / investimento)
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
    </DashboardLayout>
  );
}