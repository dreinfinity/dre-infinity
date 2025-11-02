import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";

interface MarkupData {
  custoDiretoTotal: number;
  despesasVariaveis: number;
  despesasFixas: number;
  receitaLiquida: number;
  dvPercentual: number;
  dfPercentual: number;
}

export function useMarkupData(month: number, year: number) {
  const { company } = useCompany();

  return useQuery({
    queryKey: ["markup-data", company?.id, month, year],
    queryFn: async () => {
      if (!company) throw new Error("Company not found");

      const { data, error } = await supabase.rpc("get_markup_data", {
        company_id_param: company.id,
        month_param: month,
        year_param: year,
      });

      if (error) throw error;
      
      return data as unknown as MarkupData;
    },
    enabled: !!company,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
