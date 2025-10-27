import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

export interface CashTag {
  id: string;
  company_id: string;
  name: string;
  color: string;
  created_at: string;
}

export function useCashTags() {
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags, isLoading } = useQuery({
    queryKey: ["cash-tags", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("cash_tags")
        .select("*")
        .eq("company_id", company.id)
        .order("name");

      if (error) throw error;
      return data as CashTag[];
    },
    enabled: !!company?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (params: { name: string; color: string }) => {
      if (!company?.id) throw new Error("Nenhuma empresa selecionada");

      const { data, error } = await supabase
        .from("cash_tags")
        .insert({
          company_id: company.id,
          name: params.name,
          color: params.color,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-tags"] });
      toast({
        title: "Etiqueta criada!",
        description: "A nova etiqueta foi adicionada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar etiqueta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase.from("cash_tags").delete().eq("id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-tags"] });
      toast({
        title: "Etiqueta excluída",
        description: "A etiqueta foi removida com sucesso.",
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
    tags: tags || [],
    isLoading,
    createTag: createMutation.mutate,
    deleteTag: deleteMutation.mutate,
    creating: createMutation.isPending,
  };
}
