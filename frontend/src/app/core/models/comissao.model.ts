export interface VendaComissionada {
  valor: number;
  percentual: number;
  comissao: number;
}

export interface ComissaoVendedor {
  vendedor: string;
  quantidadeVendas: number;
  totalVendido: number;
  totalComissao: number;
  vendas: VendaComissionada[];
}

export interface ResumoComissoes {
  vendedores: ComissaoVendedor[];
  totalVendido: number;
  totalComissao: number;
}
