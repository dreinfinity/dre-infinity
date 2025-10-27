import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

export interface CashTransaction {
  id: string;
  company_id: string;
  vault_type: string;
  transaction_type: string;
  amount: number;
  description: string;
  tags: string[];
  related_vault_type?: string;
  created_at: string;
}

export function useCashTransactions(vaultType?: string) {
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["cash-transactions", company?.id, vaultType],
    queryFn: async () => {
      if (!company?.id) return [];

      let query = supabase
        .from("cash_transactions")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (vaultType) {
        query = query.eq("vault_type", vaultType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CashTransaction[];
    },
    enabled: !!company?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const transaction = transactions?.find(t => t.id === transactionId);
      if (!transaction) throw new Error("Transação não encontrada");

      // Reverter saldo se não for main_balance
      if (transaction.vault_type !== "main_balance") {
        if (transaction.transaction_type === "transfer_in") {
          await supabase.rpc("transfer_between_vaults", {
            p_company_id: transaction.company_id,
            p_from_vault: transaction.vault_type,
            p_to_vault: transaction.related_vault_type || "main_balance",
            p_amount: transaction.amount,
            p_description: `Reversão: ${transaction.description}`,
          });
        } else if (transaction.transaction_type === "transfer_out") {
          await supabase.rpc("transfer_between_vaults", {
            p_company_id: transaction.company_id,
            p_from_vault: transaction.related_vault_type || "main_balance",
            p_to_vault: transaction.vault_type,
            p_amount: transaction.amount,
            p_description: `Reversão: ${transaction.description}`,
          });
        }
      }

      const { error } = await supabase
        .from("cash_transactions")
        .delete()
        .eq("id", transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-balances"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi removida e os saldos foram atualizados.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions: transactions || [],
    isLoading,
    deleteTransaction: deleteMutation.mutate,
    deleting: deleteMutation.isPending,
  };
}
