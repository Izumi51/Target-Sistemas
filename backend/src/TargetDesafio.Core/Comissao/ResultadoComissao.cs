namespace TargetDesafio.Core.Comissao;

/// <summary>
/// Venda com a comissão calculada.
/// </summary>
/// <param name="Valor">Valor da venda.</param>
/// <param name="Percentual">Percentual aplicado (0, 0,01 ou 0,05).</param>
/// <param name="Comissao">Valor da comissão, arredondado em 2 casas.</param>
public sealed record VendaComissionada(decimal Valor, decimal Percentual, decimal Comissao);

/// <summary>
/// Resumo de comissões de um vendedor.
/// </summary>
public sealed record ComissaoVendedor(
    string Vendedor,
    int QuantidadeVendas,
    decimal TotalVendido,
    decimal TotalComissao,
    IReadOnlyList<VendaComissionada> Vendas);

/// <summary>
/// Resultado geral do cálculo de comissões, com os vendedores ordenados
/// da maior para a menor comissão.
/// </summary>
public sealed record ResumoComissoes(
    IReadOnlyList<ComissaoVendedor> Vendedores,
    decimal TotalVendido,
    decimal TotalComissao);
