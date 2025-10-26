import jsPDF from "jspdf";

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
}

export function useExportPDF() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const exportDREToPDF = (
    dreData: DREData,
    month: number,
    year: number,
    companyName: string,
    filters?: {
      categoryName?: string;
      clientName?: string;
    }
  ) => {
    const doc = new jsPDF();
    
    const primaryColor: [number, number, number] = [59, 130, 246]; // azul
    const textColor: [number, number, number] = [30, 30, 30];
    const mutedColor: [number, number, number] = [120, 120, 120];
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    
    // Título
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("DRE INFINITY", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(16);
    doc.text("Demonstração do Resultado do Exercício", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.text(`Empresa: ${companyName}`, leftMargin, yPos);
    doc.text(`Período: ${month}/${year}`, rightMargin, yPos, { align: "right" });
    
    yPos += 6;
    if (filters?.categoryName) {
      doc.text(`Categoria: ${filters.categoryName}`, leftMargin, yPos);
      yPos += 6;
    }
    if (filters?.clientName) {
      doc.text(`Cliente: ${filters.clientName}`, leftMargin, yPos);
      yPos += 6;
    }
    
    yPos += 5;
    
    // Função para adicionar linha da DRE
    const addLine = (label: string, value: number, level: number, isHeader: boolean, highlight?: boolean) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const indent = leftMargin + (level * 10);
      
      doc.setFontSize(isHeader ? 11 : 10);
      doc.setFont("helvetica", isHeader ? "bold" : "normal");
      
      if (highlight) {
        doc.setFillColor(240, 240, 240);
        doc.rect(leftMargin - 2, yPos - 4, pageWidth - 40, 7, "F");
      }
      
      doc.setTextColor(...textColor);
      doc.text(label, indent, yPos);
      
      if (label) {
        const formattedValue = formatCurrency(Math.abs(value));
        const valueColor: [number, number, number] = value < 0 ? [220, 38, 38] : value > 0 ? [34, 197, 94] : textColor;
        doc.setTextColor(...valueColor);
        doc.text(formattedValue, rightMargin, yPos, { align: "right" });
      }
      
      yPos += 6;
    };
    
    // RECEITA BRUTA
    addLine("RECEITA BRUTA", dreData.receitaBruta, 0, true);
    yPos += 2;
    
    // DEDUÇÕES
    doc.setTextColor(...mutedColor);
    addLine("(-) DEDUÇÕES DA RECEITA BRUTA", 0, 0, true);
    doc.setTextColor(...textColor);
    
    if (dreData.use_das) {
      addLine("DAS - Simples Nacional", -dreData.das, 1, false);
    } else {
      addLine("ICMS", -dreData.icms, 1, false);
      addLine("IPI", -dreData.ipi, 1, false);
      addLine("PIS", -dreData.pis, 1, false);
      addLine("COFINS", -dreData.cofins, 1, false);
      addLine("ISS", -dreData.iss, 1, false);
    }
    addLine("Total de Deduções", -dreData.deducoesTotal, 1, true);
    
    yPos += 3;
    addLine("= RECEITA OPERACIONAL LÍQUIDA", dreData.receitaLiquida, 0, true, true);
    
    yPos += 3;
    addLine("(-) CMV/CSV", -dreData.cmv, 1, false);
    
    yPos += 3;
    addLine("= LUCRO BRUTO", dreData.lucroBruto, 0, true, true);
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Margem: ${formatPercent(dreData.margemBruta)}`, rightMargin - 50, yPos - 1, { align: "right" });
    doc.setTextColor(...textColor);
    
    yPos += 3;
    addLine("(-) Despesas Operacionais", -dreData.despesasOperacionais, 1, false);
    
    yPos += 3;
    addLine("= LUCRO OPERACIONAL (EBIT)", dreData.lucroOperacional, 0, true, true);
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Margem: ${formatPercent(dreData.margemOperacional)}`, rightMargin - 50, yPos - 1, { align: "right" });
    doc.setTextColor(...textColor);
    
    yPos += 3;
    addLine("(-) Despesas Financeiras", -dreData.despesasFinanceiras, 1, false);
    addLine("(+) Receitas Financeiras", dreData.receitasFinanceiras, 1, false);
    
    yPos += 3;
    addLine("= LAIR (Lucro Antes de Impostos)", dreData.lair, 0, true, true);
    
    yPos += 3;
    doc.setTextColor(...mutedColor);
    addLine("(-) IMPOSTOS SOBRE O LUCRO", 0, 0, true);
    doc.setTextColor(...textColor);
    addLine("IRPJ", -dreData.irpj, 1, false);
    addLine("IRPJ Adicional", -dreData.irpjAdicional, 1, false);
    addLine("CSLL", -dreData.csll, 1, false);
    addLine("Total de Impostos sobre Lucro", -dreData.impostosTotal, 1, true);
    
    yPos += 3;
    addLine("= LUCRO LÍQUIDO DO EXERCÍCIO", dreData.lucroLiquido, 0, true, true);
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Margem: ${formatPercent(dreData.margemLiquida)}`, rightMargin - 50, yPos - 1, { align: "right" });
    
    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...mutedColor);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString("pt-BR")} - Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    const fileName = `DRE_${month}_${year}${
      filters?.categoryName ? "_" + filters.categoryName : ""
    }${filters?.clientName ? "_" + filters.clientName : ""}.pdf`;
    
    doc.save(fileName);
  };

  return { exportDREToPDF };
}
