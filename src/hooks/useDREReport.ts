import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";

interface DREData {
  receitaBruta: number;
  icms: number;
  ipi: number;
  pis: number;
  cofins: number;
  iss: number;
  das: number;
  use_das: boolean;
  deducoesTotal: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroOperacional: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  lair: number;
  irpj: number;
  irpjAdicional: number;
  csll: number;
  impostosTotal: number;
  lucroLiquido: number;
  margemBruta: number;
  margemOperacional: number;
  margemLiquida: number;
  avDeducoes: number;
  avCmv: number;
  avDespesasOperacionais: number;
  avDespesasFinanceiras: number;
  avReceitasFinanceiras: number;
  avImpostos: number;
}

export function useDREReport(month: number, year: number) {
  const { company } = useCompany();

  return useQuery({
    queryKey: ["dre-report", company?.id, month, year],
    queryFn: async () => {
      if (!company) throw new Error("Company not found");

      const { data, error } = await supabase.rpc("get_dre_report", {
        company_id_param: company.id,
        month_param: month,
        year_param: year,
      });

      if (error) throw error;
      
      // Garantir que retornamos um objeto DREData válido
      return data as unknown as DREData;
    },
    enabled: !!company,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
