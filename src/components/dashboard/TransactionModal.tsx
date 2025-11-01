import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType: "administrative" | "operational";
  onSubmit: (data: any) => Promise<void>;
}

export function TransactionModal({
  open,
  onOpenChange,
  transactionType,
  onSubmit,
}: TransactionModalProps) {
  const [hasClient, setHasClient] = useState(false);
  const [isMarketingOrSales, setIsMarketingOrSales] = useState(false);
  const [costType, setCostType] = useState<"marketing" | "sales">("marketing");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transaction_date: new Date(),
    category_id: "",
    client_id: "",
    is_new_client: false,
  });

  const { categories } = useCategories();
  const { clients } = useClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData: any = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      transaction_date: format(formData.transaction_date, "yyyy-MM-dd"),
      category_id: formData.category_id || null,
      transaction_type: transactionType,
    };

    // Add operational fields
    if (transactionType === "operational") {
      if (hasClient) {
        transactionData.client_id = formData.client_id || null;
        transactionData.is_new_client = formData.is_new_client;
      }
      if (isMarketingOrSales) {
        transactionData.is_marketing_cost = costType === "marketing";
        transactionData.is_sales_cost = costType === "sales";
      }
    }

    await onSubmit(transactionData);
    resetForm();
  };

  const resetForm = () => {
    onOpenChange(false);
    setHasClient(false);
    setIsMarketingOrSales(false);
    setCostType("marketing");
    setFormData({
      description: "",
      amount: "",
      transaction_date: new Date(),
      category_id: "",
      client_id: "",
      is_new_client: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Novo Lançamento {transactionType === "operational" && "Operacional"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da transação financeira
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.transaction_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transaction_date ? (
                      format(formData.transaction_date, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={formData.transaction_date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, transaction_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Venda de produtos"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
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
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0,00"
                required
              />
            </div>

            {/* Operational Fields */}
            {transactionType === "operational" && (
              <>
                <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                  <Switch
                    id="has-client"
                    checked={hasClient}
                    onCheckedChange={setHasClient}
                  />
                  <Label htmlFor="has-client" className="cursor-pointer">
                    Cliente Envolvido
                  </Label>
                </div>

                {hasClient && (
                  <>
                    <div>
                      <Label htmlFor="client">Cliente</Label>
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, client_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                      <Switch
                        id="is-new-client"
                        checked={formData.is_new_client}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_new_client: checked })
                        }
                      />
                      <Label htmlFor="is-new-client" className="cursor-pointer">
                        Cliente Novo? (para cálculo de CAC)
                      </Label>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                  <Switch
                    id="is-marketing-sales"
                    checked={isMarketingOrSales}
                    onCheckedChange={setIsMarketingOrSales}
                  />
                  <Label htmlFor="is-marketing-sales" className="cursor-pointer">
                    Custo de Marketing/Vendas
                  </Label>
                </div>

                {isMarketingOrSales && (
                  <div>
                    <Label>Tipo de Custo</Label>
                    <RadioGroup
                      value={costType}
                      onValueChange={(value: "marketing" | "sales") =>
                        setCostType(value)
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="marketing" id="marketing" />
                        <Label htmlFor="marketing" className="cursor-pointer">
                          Marketing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sales" id="sales" />
                        <Label htmlFor="sales" className="cursor-pointer">
                          Vendas
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="glow">
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
