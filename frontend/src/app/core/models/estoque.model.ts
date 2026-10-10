export interface Produto {
  codigoProduto: number;
  descricaoProduto: string;
  estoque: number;
}

export type TipoMovimentacao = 'Entrada' | 'Saida';

export interface Movimentacao {
  id: number;
  codigoProduto: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  descricao: string;
  dataHora: string;
  estoqueAnterior: number;
  estoqueFinal: number;
}

export interface NovaMovimentacao {
  codigoProduto: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  descricao: string;
}

export interface ResultadoMovimentacao {
  movimentacao: Movimentacao;
  produto: Produto;
  estoqueFinal: number;
}
