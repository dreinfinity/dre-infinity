import { useState, useEffect } from "react";

const TOUR_STORAGE_KEY = "dre-infinity-tour-completed";

export interface TourStep {
  target: string;
  content: string;
  title?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  disableBeacon?: boolean;
}

export const useTour = (pageName: string) => {
  const [run, setRun] = useState(false);
  const storageKey = `${TOUR_STORAGE_KEY}-${pageName}`;

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(storageKey);
    if (!hasCompletedTour) {
      // Aguardar um pouco para garantir que os elementos estejam renderizados
      const timer = setTimeout(() => setRun(true), 500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const startTour = () => {
    setRun(true);
  };

  const completeTour = () => {
    localStorage.setItem(storageKey, "true");
    setRun(false);
  };

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setRun(true);
  };

  return {
    run,
    startTour,
    completeTour,
    resetTour,
  };
};

// Tours específicos por página
export const DASHBOARD_TOUR: TourStep[] = [
  {
    target: "body",
    content: "Bem-vindo ao DRE Infinity! Vou te guiar pelos principais recursos da plataforma.",
    title: "Bem-vindo!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[href="/settings"]',
    content: "Primeiro, vamos configurar sua empresa. Clique em Configurações para cadastrar custos, despesas, receitas e clientes.",
    title: "Passo 1: Configurações",
    placement: "bottom",
  },
  {
    target: '[href="/transactions"]',
    content: "Após configurar, vá em Lançamentos para registrar suas transações administrativas e operacionais.",
    title: "Passo 2: Lançamentos",
    placement: "bottom",
  },
  {
    target: ".dashboard-kpis",
    content: "Aqui você visualiza os principais indicadores da sua empresa em tempo real.",
    title: "Dashboard - KPIs",
    placement: "bottom",
  },
  {
    target: ".dashboard-charts",
    content: "Estes gráficos mostram a evolução dos seus indicadores ao longo do tempo.",
    title: "Dashboard - Gráficos",
    placement: "top",
  },
];

export const TRANSACTIONS_TOUR: TourStep[] = [
  {
    target: "body",
    content: "Aqui você registra todas as movimentações financeiras da empresa.",
    title: "Lançamentos",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".transaction-type-selector",
    content: "Escolha entre lançamentos Administrativos ou Operacionais.",
    title: "Tipo de Lançamento",
    placement: "bottom",
  },
  {
    target: ".new-transaction-button",
    content: "Clique aqui para adicionar um novo lançamento.",
    title: "Novo Lançamento",
    placement: "left",
  },
  {
    target: ".transaction-list",
    content: "Exemplos de lançamentos: Custo Fixo (Aluguel), Custo de Campanha, e Receita de Venda.",
    title: "Sugestões",
    placement: "top",
  },
];

export const CASH_TOUR: TourStep[] = [
  {
    target: "body",
    content: "O módulo de Caixa permite gerenciar diferentes cofres virtuais para organizar seu dinheiro.",
    title: "Módulo Caixa",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".vault-cards",
    content: "Aqui estão seus cofres: Reserva de Emergência, Capital de Giro, Investimentos e Retiradas.",
    title: "Cofres Virtuais",
    placement: "bottom",
  },
  {
    target: ".transfer-button",
    content: "Use este botão para transferir valores entre cofres ou fazer retiradas.",
    title: "Transferências",
    placement: "left",
  },
];

export const BREAK_EVEN_TOUR: TourStep[] = [
  {
    target: "body",
    content: "O Ponto de Equilíbrio mostra quanto você precisa faturar para cobrir todos os custos.",
    title: "Ponto de Equilíbrio",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".break-even-chart",
    content: "Este gráfico visualiza o ponto onde suas receitas igualam seus custos.",
    title: "Gráfico de Break-Even",
    placement: "bottom",
  },
];

export const SCENARIOS_TOUR: TourStep[] = [
  {
    target: "body",
    content: "Aqui você pode simular diferentes cenários financeiros para sua empresa.",
    title: "Simulações",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".scenario-inputs",
    content: "Ajuste os valores para ver como mudanças afetam seus resultados.",
    title: "Parâmetros",
    placement: "bottom",
  },
];
