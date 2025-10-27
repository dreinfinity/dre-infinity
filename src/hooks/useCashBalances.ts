import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

export interface CashBalances {
  totalBalance: number;
  netBalance: number;
  emergencyReserve: number;
  workingCapital: number;
  investments: number;
  withdrawals: number;
  availableBalance: number;
}

export function useCashBalances() {
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: balances, isLoading } = useQuery({
    queryKey: ["cash-balances", company?.id],
    queryFn: async () => {
      if (!company?.id) return null;

      const { data, error } = await supabase.rpc("calculate_cash_balances", {
        p_company_id: company.id,
      });

      if (error) throw error;
      return data as unknown as CashBalances;
    },
    enabled: !!company?.id,
  });

  const transferMutation = useMutation({
    mutationFn: async (params: {
      fromVault: string;
      toVault: string;
      amount: number;
      description: string;
      tags?: string[];
    }) => {
      if (!company?.id) throw new Error("Nenhuma empresa selecionada");

      const { data, error } = await supabase.rpc("transfer_between_vaults", {
        p_company_id: company.id,
        p_from_vault: params.fromVault,
        p_to_vault: params.toVault,
        p_amount: params.amount,
        p_description: params.description,
        p_tags: params.tags || [],
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-balances"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      toast({
        title: "Transferência realizada!",
        description: "Os saldos foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na transferência",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    balances,
    isLoading,
    transfer: transferMutation.mutate,
    transferLoading: transferMutation.isPending,
  };
}
