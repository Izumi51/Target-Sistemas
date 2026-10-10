export interface ResultadoJuros {
  valor: number;
  vencimento: string;     // YYYY-MM-DD
  dataCalculo: string;    // YYYY-MM-DD
  diasAtraso: number;
  taxaDiaria: number;     // 0.025
  juros: number;
  total: number;
  vencido: boolean;
}

export interface ConsultaJuros {
  valor: number;
  vencimento: string;
}
