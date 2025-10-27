import { GlassCard } from "@/components/GlassCard";
import { InfoPopover } from "./InfoPopover";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

interface VaultCardProps {
  title: string;
  balance: number;
  icon: React.ReactNode;
  color: string;
  infoContent: string;
  onTransfer: () => void;
  canWithdraw?: boolean;
}

export function VaultCard({
  title,
  balance,
  icon,
  color,
  infoContent,
  onTransfer,
  canWithdraw = true,
}: VaultCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <GlassCard className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              <InfoPopover title={title} content={infoContent} />
            </div>
            <p className="text-3xl font-bold mt-2">{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onTransfer}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <ArrowDownLeft className="w-4 h-4 mr-2" />
          Depositar
        </Button>
        {canWithdraw && (
          <Button
            onClick={onTransfer}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Retirar
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
