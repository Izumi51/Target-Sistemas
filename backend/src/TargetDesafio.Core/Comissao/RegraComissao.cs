namespace TargetDesafio.Core.Comissao;

/// <summary>
/// Regra de comissão por venda:
/// <list type="bullet">
///   <item>Abaixo de R$ 100,00: sem comissão (0%).</item>
///   <item>De R$ 100,00 até abaixo de R$ 500,00: 1%.</item>
///   <item>A partir de R$ 500,00: 5%.</item>
/// </list>
/// </summary>
public static class RegraComissao
{
    public const decimal LimiteFaixaUm = 100.00m;
    public const decimal LimiteFaixaCinco = 500.00m;

    public const decimal PercentualSemComissao = 0.00m;
    public const decimal PercentualFaixaUm = 0.01m;
    public const decimal PercentualFaixaCinco = 0.05m;

    /// <summary>
    /// Retorna o percentual de comissão (ex.: 0,05 = 5%) aplicável ao valor da venda.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">Quando o valor é negativo.</exception>
    public static decimal ObterPercentual(decimal valorVenda)
    {
        if (valorVenda < 0)
            throw new ArgumentOutOfRangeException(nameof(valorVenda), valorVenda, "O valor da venda não pode ser negativo.");

        return valorVenda switch
        {
            < LimiteFaixaUm => PercentualSemComissao,
            < LimiteFaixaCinco => PercentualFaixaUm,
            _ => PercentualFaixaCinco
        };
    }

    /// <summary>
    /// Calcula o valor da comissão de uma venda, arredondado em 2 casas (meio para cima).
    /// </summary>
    public static decimal CalcularComissao(decimal valorVenda) =>
        Math.Round(valorVenda * ObterPercentual(valorVenda), 2, MidpointRounding.AwayFromZero);
}
