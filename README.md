# DRE Infinity - Gestão Financeira Inteligente

<div align="center">

![DRE Infinity](https://img.shields.io/badge/DRE-Infinity-6366f1?style=for-the-badge&logo=trending-up&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)

**Plataforma completa de gestão financeira para PMEs com DRE automatizado, análise de métricas e simulação de cenários**

[🚀 Demo](https://lovable.dev/projects/376731ed-6256-4463-bae2-5966b5a9aaa2) • [📚 Documentação](./ARCHITECTURE.md) • [💬 Suporte](#)

</div>

---

## 🎯 Sobre o Projeto

**DRE Infinity** é uma solução SaaS moderna que automatiza a gestão financeira de pequenas e médias empresas, oferecendo:

- ✅ **DRE Automático em Tempo Real** - Cálculo instantâneo de receitas, custos, despesas e lucros
- 📊 **Métricas Avançadas** - CAC, LTV, ROI, Ticket Médio e Ponto de Equilíbrio
- 🎯 **Metas e Orçamento** - Defina objetivos e acompanhe progresso automaticamente
- 📈 **Análise Horizontal e Vertical** - Compare períodos e identifique tendências
- 💼 **Simulador de Cenários** - Teste estratégias antes de implementar
- 💰 **Gestão de Caixa** - Organize recursos em cofres virtuais (Reserva, Capital de Giro, Investimentos)
- 📄 **Relatórios Profissionais** - Exporte para Excel com análises completas

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI moderna
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Styling utilitário
- **shadcn/ui** - Componentes acessíveis
- **Recharts** - Visualização de dados
- **TanStack Query** - State management e cache

### Backend & Infraestrutura
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados relacional
  - Row Level Security (RLS) - Segurança em nível de linha
  - Edge Functions - Serverless functions
  - Real-time subscriptions - Atualizações em tempo real
- **Lovable** - Plataforma de desenvolvimento

---

## 🚀 Instalação e Uso

### Pré-requisitos
```bash
Node.js >= 18.x
npm ou yarn
```

### Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Navegue até o diretório
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

---

## 📦 Estrutura do Projeto

```
dre-infinity/
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   ├── cash/          # Módulo de Caixa
│   │   ├── dashboard/     # Componentes do Dashboard
│   │   └── settings/      # Componentes de Configurações
│   ├── pages/             # Páginas da aplicação
│   │   ├── Landing.tsx    # Página inicial pública
│   │   ├── Auth.tsx       # Login/Registro
│   │   ├── Dashboard.tsx  # Dashboard principal
│   │   ├── CashFlow.tsx   # Módulo Caixa
│   │   ├── Reports.tsx    # Relatórios DRE
│   │   ├── Goals.tsx      # Metas e Orçamento
│   │   ├── Scenarios.tsx  # Simulador
│   │   └── Pricing.tsx    # Planos e Assinaturas
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React Context (Auth, Company)
│   ├── integrations/      # Integrações externas (Supabase)
│   └── lib/               # Utilitários
├── supabase/
│   ├── migrations/        # Migrações do banco de dados
│   └── config.toml        # Configuração Supabase
└── public/                # Assets estáticos
```

---

## 💎 Funcionalidades Principais

### 1. Dashboard Financeiro
- **KPIs em Tempo Real**: Lucro Líquido, Receita Líquida, CAC, LTV, ROI
- **Gráficos Interativos**: Evolução mensal, funil de receita, comparação de metas
- **Indicadores Visuais**: Progress bars, badges de status, alertas inteligentes

### 2. DRE Automático
- **Cálculo Automático**: Receitas, Deduções, CMV, Despesas, Lucro Líquido
- **Análise Vertical (% AV)**: Proporção de cada linha em relação à Receita Líquida
- **Análise Horizontal (% AH)**: Comparação mensal para identificar tendências
- **Configuração de Impostos**: Simples Nacional (DAS) ou Lucro Presumido/Real

### 3. Métricas de Crescimento
- **CAC (Customer Acquisition Cost)**: Quanto custa adquirir um cliente
- **LTV (Lifetime Value)**: Valor total que um cliente gera
- **LTV/CAC Ratio**: Indicador de eficiência de marketing e vendas
- **ROI (Return on Investment)**: Retorno sobre investimento
- **Ticket Médio**: Valor médio por transação

### 4. Ponto de Equilíbrio
- **Break-Even Point**: Quanto precisa faturar para cobrir custos
- **Margem de Segurança**: % de queda de receita tolerável
- **Margem de Contribuição**: Lucro após custos variáveis

### 5. Módulo Caixa (Novo!)
- **Saldo Total**: Soma de todas as receitas
- **Saldo Líquido**: Receitas - (Custos + Despesas)
- **Cofres Virtuais**:
  - 🏦 **Reserva de Emergência** - Fundo para imprevistos (ideal: 12 meses de custos)
  - 💼 **Capital de Giro** - Dinheiro para operação diária
  - 📈 **Investimentos** - Recursos para crescimento (marketing, expansão)
  - 💸 **Retiradas** - Pró-labore e distribuição de lucros (irreversível)
- **Etiquetas Personalizadas**: Organize lançamentos com tags coloridas
- **Histórico Completo**: Todos os movimentos com edição e exclusão

### 6. Sistema de Planos (Freemium)

#### 🚀 Functional (R$ 97/mês)
- Dashboard completo
- Lançamentos ilimitados
- Relatórios DRE básicos
- 1 empresa
- Suporte por email

#### 📈 Growth (R$ 197/mês) - **Mais Popular**
- Tudo do Functional +
- Metas e orçamento
- Análise horizontal
- Break-even e cenários
- Exportação Excel ilimitada
- Até 3 empresas
- Suporte prioritário

#### 👑 Infinity (R$ 397/mês)
- Tudo do Growth +
- Empresas ilimitadas
- Módulo Caixa completo
- API de integração
- Relatórios personalizados
- Suporte 24/7 prioritário
- Consultoria mensal inclusa

**Todos os planos incluem:**
- ✅ 14 dias grátis
- ✅ Sem cartão de crédito no trial
- ✅ Cancele quando quiser
- ✅ Pagamento via Stripe

---

## 🔒 Segurança

- **Row Level Security (RLS)**: Políticas de segurança em nível de banco de dados
- **Autenticação Supabase**: Sistema robusto de auth com JWT
- **Criptografia**: Dados sensíveis criptografados
- **LGPD Compliant**: Conformidade com legislação brasileira
- **Backup Automático**: Supabase gerencia backups diários

---

## 📊 Arquitetura de Dados

```sql
-- Principais tabelas
companies           # Empresas dos usuários
transactions        # Lançamentos financeiros
dre_categories      # Categorias do DRE (Receitas, Custos, Despesas)
metrics_cache       # Cache de métricas calculadas
tax_configurations  # Configurações de impostos
goals               # Metas mensais
cash_vaults         # Cofres do módulo Caixa
cash_transactions   # Transações entre cofres
cash_tags           # Etiquetas personalizadas
subscriptions       # Planos e assinaturas dos usuários
```

Para mais detalhes, consulte [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🎨 Design System

O projeto utiliza um design system consistente baseado em:

- **Paleta de Cores**: Definida via CSS variables (HSL)
- **Tipografia**: System fonts otimizadas
- **Componentes**: shadcn/ui customizados
- **Animações**: Tailwind + custom keyframes
- **Responsividade**: Mobile-first approach

---

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build de produção
npm run lint         # Lint com ESLint
```

---

## 🚢 Deploy

### Lovable (Recomendado)
1. Acesse [Lovable Project](https://lovable.dev/projects/376731ed-6256-4463-bae2-5966b5a9aaa2)
2. Clique em **Share → Publish**
3. Seu app estará online em segundos!

### Custom Domain
1. Navegue até **Project > Settings > Domains**
2. Clique em **Connect Domain**
3. Siga as instruções de configuração DNS

---

## 🤝 Contribuindo

Este é um projeto proprietário. Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

## 📧 Suporte

- **Email**: suporte@dreinfinity.com.br
- **Discord**: [Link da comunidade](#)
- **Documentação**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📄 Licença

Copyright © 2025 DRE Infinity. Todos os direitos reservados.

---

<div align="center">

**Feito com ❤️ para PMEs brasileiras**

[🚀 Começar Agora](https://lovable.dev/projects/376731ed-6256-4463-bae2-5966b5a9aaa2)

</div>
