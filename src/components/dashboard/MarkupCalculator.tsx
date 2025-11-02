import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarkupData } from "@/hooks/useMarkupData";
import { useCategories } from "@/hooks/useCategories";
import { Settings, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MarkupCalculatorProps {
  month: number;
  year: number;
}

export function MarkupCalculator({ month, year }: MarkupCalculatorProps) {
  const { data: markupData, isLoading } = useMarkupData(month, year);
  const { categories, refreshCategories } = useCategories();
  const { toast } = useToast();
  const [margemLucro, setMargemLucro] = useState<number>(30);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [categoryMarkupTypes, setCategoryMarkupTypes] = useState<Record<string, string | null>>({});

  useEffect(() => {
    // Inicializar os tipos de markup das categorias
    const types: Record<string, string | null> = {};
    categories.forEach((cat) => {
      types[cat.id] = (cat as any).markup_type || null;
    });
    setCategoryMarkupTypes(types);
  }, [categories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Cálculo do Markup (Divisor)
  const calcularMarkup = () => {
    if (!markupData) return 0;
    const denominador = 100 - (markupData.dvPercentual + markupData.dfPercentual + margemLucro);
    if (denominador <= 0) return 0;
    return 100 / denominador;
  };

  // Cálculo do Preço de Venda
  const calcularPrecoVenda = () => {
    if (!markupData) return 0;
    return markupData.custoDiretoTotal * calcularMarkup();
  };

  const handleSaveConfiguration = async () => {
    try {
      // Atualizar cada categoria com o tipo de markup
      for (const [categoryId, markupType] of Object.entries(categoryMarkupTypes)) {
        const { error } = await supabase
          .from("dre_categories")
          .update({ markup_type: markupType })
          .eq("id", categoryId);

        if (error) throw error;
      }

      toast({
        title: "✅ Configurações Salvas",
        description: "As categorias foram vinculadas ao cálculo de Markup.",
      });

      refreshCategories();
      setConfigDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "❌ Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markup = calcularMarkup();
  const precoVenda = calcularPrecoVenda();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <GradientText>Cálculo de Markup</GradientText>
        </h2>
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurar Categorias para Markup</DialogTitle>
              <DialogDescription>
                Vincule cada categoria a um dos tipos de Markup: Custo Direto (CD), Despesa Variável (DV) ou Despesa Fixa (DF).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-4">
                  <Label className="flex-1">{category.name}</Label>
                  <Select
                    value={categoryMarkupTypes[category.id] || "none"}
                    onValueChange={(value) => {
                      setCategoryMarkupTypes({
                        ...categoryMarkupTypes,
                        [category.id]: value === "none" ? null : value,
                      });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não vincular</SelectItem>
                      <SelectItem value="CD">Custo Direto (CD)</SelectItem>
                      <SelectItem value="DV">Despesa Variável (DV)</SelectItem>
                      <SelectItem value="DF">Despesa Fixa (DF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfiguration}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Custo Direto (CD)</h3>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">
            {isLoading ? "..." : formatCurrency(markupData?.custoDiretoTotal || 0)}
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Despesas Variáveis (DV%)</h3>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">
            {isLoading ? "..." : formatPercent(markupData?.dvPercentual || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? "..." : formatCurrency(markupData?.despesasVariaveis || 0)}
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Despesas Fixas (DF%)</h3>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">
            {isLoading ? "..." : formatPercent(markupData?.dfPercentual || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? "..." : formatCurrency(markupData?.despesasFixas || 0)}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="margem-lucro">Margem de Lucro Desejada (%)</Label>
            <Input
              id="margem-lucro"
              type="number"
              step="0.01"
              value={margemLucro}
              onChange={(e) => setMargemLucro(Number(e.target.value))}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Índice Markup (Divisor)</h3>
              <p className="text-3xl font-bold">
                <GradientText>{markup.toFixed(4)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Fórmula: 100 / [100 - (DV% + DF% + ML%)]
              </p>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Preço de Venda Sugerido</h3>
              <p className="text-3xl font-bold">
                <GradientText>{formatCurrency(precoVenda)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Fórmula: Custo Direto × Markup
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
