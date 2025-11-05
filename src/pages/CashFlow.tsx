import { useState } from "react";
import { useCashBalances } from "@/hooks/useCashBalances";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { VaultCard } from "@/components/cash/VaultCard";
import { TransferDialog } from "@/components/cash/TransferDialog";
import { TransactionList } from "@/components/cash/TransactionList";
import { TagManager } from "@/components/cash/TagManager";
import { DateFilter } from "@/components/cash/DateFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Shield, TrendingUp, DollarSign, ArrowDownToLine, Loader2, PiggyBank } from "lucide-react";
import { format } from "date-fns";
import { TourGuide } from "@/components/TourGuide";
import { useTour, CASH_TOUR } from "@/hooks/useTour";

export default function CashFlow() {
  const { run, completeTour } = useTour("cash");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : undefined;
  
  const { balances, isLoading } = useCashBalances(startDateStr, endDateStr);

  const handleDateChange = (newStartDate?: Date, newEndDate?: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const formatCurrency = (value: number | undefined) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const vaultInfo = {
    emergency_reserve: "A Reserva de Emergência é um fundo para cobrir imprevistos e crises. O ideal é que cubra 12 meses de custos fixos da empresa, garantindo segurança financeira em períodos de baixa receita.",
    working_capital: "Capital de Giro é o dinheiro disponível para as operações diárias da empresa, como pagamento de fornecedores e despesas correntes. Manter um capital de giro saudável garante a continuidade do negócio.",
    investments: "Investimentos são recursos destinados a crescimento e expansão do negócio, como marketing, novos equipamentos, treinamentos ou desenvolvimento de produtos. Alocar parte do lucro para investimentos é essencial para a evolução da empresa.",
    withdrawals: "Retiradas são valores que saem definitivamente do caixa da empresa, como pró-labore, distribuição de lucros ou despesas pessoais dos sócios. Uma vez retirado, esse valor não retorna ao fluxo de caixa.",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <TourGuide run={run} steps={CASH_TOUR} onComplete={completeTour} />
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <GradientText className="text-4xl font-bold mb-2">
              Gestão de Caixa
            </GradientText>
            <p className="text-muted-foreground">
              Gerencie seus cofres e organize seus recursos financeiros
            </p>
          </div>
          <div className="transfer-button">
            <TransferDialog />
          </div>
        </div>
        
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Dashboard de Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold text-sm text-muted-foreground">Saldo Disponível</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balances?.availableBalance)}</p>
          <p className="text-xs text-muted-foreground mt-1">Igual ao saldo líquido</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold text-sm text-muted-foreground">Saldo Líquido</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balances?.netBalance)}</p>
          <p className="text-xs text-muted-foreground mt-1">Receitas - (Custos + Despesas)</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <PiggyBank className="w-6 h-6 text-purple-500" />
            <h3 className="font-semibold text-sm text-muted-foreground">Valores Aplicados</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balances?.valoresAplicados)}</p>
          <p className="text-xs text-muted-foreground mt-1">Reserva + Capital + Investimentos</p>
        </GlassCard>
      </div>

      {/* Cofres */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Cofres Virtuais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 vault-cards">
          <VaultCard
            title="Reserva de Emergência"
            balance={balances?.emergencyReserve || 0}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            infoContent={vaultInfo.emergency_reserve}
            onTransfer={() => {}}
          />

          <VaultCard
            title="Capital de Giro"
            balance={balances?.workingCapital || 0}
            icon={<Wallet className="w-6 h-6 text-white" />}
            color="bg-green-500"
            infoContent={vaultInfo.working_capital}
            onTransfer={() => {}}
          />

          <VaultCard
            title="Investimentos"
            balance={balances?.investments || 0}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            infoContent={vaultInfo.investments}
            onTransfer={() => {}}
          />

          <VaultCard
            title="Retiradas"
            balance={balances?.withdrawals || 0}
            icon={<ArrowDownToLine className="w-6 h-6 text-white" />}
            color="bg-red-500"
            infoContent={vaultInfo.withdrawals}
            onTransfer={() => {}}
            canWithdraw={false}
          />
        </div>
      </div>

      {/* Gerenciador de Etiquetas */}
      <TagManager />

      {/* Histórico de Transações */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Histórico de Transações</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="main_balance">Disponível</TabsTrigger>
            <TabsTrigger value="emergency_reserve">Reserva</TabsTrigger>
            <TabsTrigger value="working_capital">Capital</TabsTrigger>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="withdrawals">Retiradas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <TransactionList />
          </TabsContent>
          <TabsContent value="main_balance" className="mt-6">
            <TransactionList vaultType="main_balance" />
          </TabsContent>
          <TabsContent value="emergency_reserve" className="mt-6">
            <TransactionList vaultType="emergency_reserve" />
          </TabsContent>
          <TabsContent value="working_capital" className="mt-6">
            <TransactionList vaultType="working_capital" />
          </TabsContent>
          <TabsContent value="investments" className="mt-6">
            <TransactionList vaultType="investments" />
          </TabsContent>
          <TabsContent value="withdrawals" className="mt-6">
            <TransactionList vaultType="withdrawals" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
