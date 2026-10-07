namespace TargetDesafio.Core.Juros;

/// <summary>
/// Resultado do cálculo de juros de um título em atraso.
/// </summary>
/// <param name="Valor">Valor original do título.</param>
/// <param name="Vencimento">Data de vencimento.</param>
/// <param name="DataCalculo">Data usada como "hoje" no cálculo.</param>
/// <param name="DiasAtraso">Dias corridos de atraso (0 se ainda não venceu).</param>
/// <param name="TaxaDiaria">Taxa aplicada por dia de atraso (ex.: 0,025 = 2,5%).</param>
/// <param name="Juros">Valor dos juros, arredondado em 2 casas.</param>
/// <param name="Total">Valor original + juros.</param>
public sealed record ResultadoJuros(
    decimal Valor,
    DateOnly Vencimento,
    DateOnly DataCalculo,
    int DiasAtraso,
    decimal TaxaDiaria,
    decimal Juros,
    decimal Total)
{
    /// <summary>Indica se o título está vencido na data do cálculo.</summary>
    public bool Vencido => DiasAtraso > 0;
}
