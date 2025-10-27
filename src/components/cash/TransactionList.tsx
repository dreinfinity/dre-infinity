import { useCashTransactions } from "@/hooks/useCashTransactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  vaultType?: string;
}

export function TransactionList({ vaultType }: TransactionListProps) {
  const { transactions, deleteTransaction, deleting } = useCashTransactions(vaultType);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getVaultLabel = (type: string) => {
    const labels: Record<string, string> = {
      main_balance: "Saldo Disponível",
      emergency_reserve: "Reserva de Emergência",
      working_capital: "Capital de Giro",
      investments: "Investimentos",
      withdrawals: "Retiradas",
    };
    return labels[type] || type;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-2 rounded-lg ${
              transaction.transaction_type === "transfer_in" 
                ? "bg-green-500/20 text-green-500" 
                : "bg-red-500/20 text-red-500"
            }`}>
              {transaction.transaction_type === "transfer_in" ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">{transaction.description}</p>
                {transaction.related_vault_type && (
                  <Badge variant="outline" className="text-xs">
                    {transaction.transaction_type === "transfer_in" ? "De" : "Para"}{" "}
                    {getVaultLabel(transaction.related_vault_type)}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <span>
                  {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
                {transaction.tags && Array.isArray(transaction.tags) && transaction.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex gap-1">
                      {transaction.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className={`text-lg font-bold ${
                transaction.transaction_type === "transfer_in" 
                  ? "text-green-500" 
                  : "text-red-500"
              }`}>
                {transaction.transaction_type === "transfer_in" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta transação? O saldo será revertido automaticamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteTransaction(transaction.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
