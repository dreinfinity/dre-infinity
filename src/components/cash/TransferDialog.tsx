import { useState } from "react";
import { useCashBalances } from "@/hooks/useCashBalances";
import { useCashTags } from "@/hooks/useCashTags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft } from "lucide-react";

interface TransferDialogProps {
  trigger?: React.ReactNode;
}

export function TransferDialog({ trigger }: TransferDialogProps) {
  const { transfer, transferLoading, balances } = useCashBalances();
  const { tags } = useCashTags();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromVault: "main_balance",
    toVault: "",
    amount: "",
    description: "",
    selectedTags: [] as string[],
  });

  const vaultOptions = [
    { value: "main_balance", label: "Saldo Disponível" },
    { value: "emergency_reserve", label: "Reserva de Emergência" },
    { value: "working_capital", label: "Capital de Giro" },
    { value: "investments", label: "Investimentos" },
    { value: "withdrawals", label: "Retiradas" },
  ];

  const handleSubmit = () => {
    if (!formData.toVault || !formData.amount || !formData.description) return;

    transfer({
      fromVault: formData.fromVault,
      toVault: formData.toVault,
      amount: parseFloat(formData.amount),
      description: formData.description,
      tags: formData.selectedTags,
    });
    
    setOpen(false);
    setFormData({
      fromVault: "main_balance",
      toVault: "",
      amount: "",
      description: "",
      selectedTags: [],
    });
  };

  const toggleTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter(t => t !== tagName)
        : [...prev.selectedTags, tagName],
    }));
  };

  const availableBalance = 
    formData.fromVault === "main_balance" 
      ? balances?.availableBalance || 0
      : formData.fromVault === "emergency_reserve"
      ? balances?.emergencyReserve || 0
      : formData.fromVault === "working_capital"
      ? balances?.workingCapital || 0
      : formData.fromVault === "investments"
      ? balances?.investments || 0
      : 0;

  const isInsufficientBalance = parseFloat(formData.amount) > availableBalance;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="glow" size="lg">
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            Nova Transferência
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Transferência</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="from-vault">De</Label>
            <Select
              value={formData.fromVault}
              onValueChange={(value) => setFormData({ ...formData, fromVault: value })}
            >
              <SelectTrigger id="from-vault">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vaultOptions
                  .filter(opt => opt.value !== "withdrawals")
                  .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Disponível: R$ {availableBalance.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="to-vault">Para</Label>
            <Select
              value={formData.toVault}
              onValueChange={(value) => setFormData({ ...formData, toVault: value })}
            >
              <SelectTrigger id="to-vault">
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                {vaultOptions
                  .filter(opt => opt.value !== formData.fromVault)
                  .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
            />
            {isInsufficientBalance && formData.amount && (
              <p className="text-sm text-destructive mt-1">
                Saldo insuficiente. Disponível: R$ {availableBalance.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a transferência..."
              rows={3}
            />
          </div>

          <div>
            <Label>Etiquetas (opcional)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ 
                    backgroundColor: formData.selectedTags.includes(tag.name) ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: formData.selectedTags.includes(tag.name) ? 'white' : tag.color,
                  }}
                  className="cursor-pointer border-2"
                  onClick={() => toggleTag(tag.name)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={transferLoading || !formData.toVault || !formData.amount || !formData.description || isInsufficientBalance}
              className="flex-1"
            >
              {transferLoading ? "Transferindo..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
