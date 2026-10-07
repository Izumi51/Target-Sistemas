namespace TargetDesafio.Core.Comissao;

/// <summary>
/// Calcula a comissão de cada vendedor a partir de uma lista de vendas.
/// </summary>
public sealed class CalculadoraComissao
{
    public ResumoComissoes Calcular(IEnumerable<Venda> vendas)
    {
        ArgumentNullException.ThrowIfNull(vendas);

        var vendedores = vendas
            .Select(Validar)
            .GroupBy(v => v.Vendedor.Trim())
            .Select(grupo =>
            {
                var itens = grupo
                    .Select(v => new VendaComissionada(
                        v.Valor,
                        RegraComissao.ObterPercentual(v.Valor),
                        RegraComissao.CalcularComissao(v.Valor)))
                    .ToList();

                return new ComissaoVendedor(
                    Vendedor: grupo.Key,
                    QuantidadeVendas: itens.Count,
                    TotalVendido: itens.Sum(i => i.Valor),
                    TotalComissao: itens.Sum(i => i.Comissao),
                    Vendas: itens);
            })
            .OrderByDescending(c => c.TotalComissao)
            .ThenBy(c => c.Vendedor, StringComparer.CurrentCulture)
            .ToList();

        return new ResumoComissoes(
            vendedores,
            TotalVendido: vendedores.Sum(v => v.TotalVendido),
            TotalComissao: vendedores.Sum(v => v.TotalComissao));
    }

    private static Venda Validar(Venda venda)
    {
        ArgumentNullException.ThrowIfNull(venda);

        if (string.IsNullOrWhiteSpace(venda.Vendedor))
            throw new ArgumentException("Toda venda deve informar o vendedor.", nameof(venda));

        if (venda.Valor < 0)
            throw new ArgumentOutOfRangeException(nameof(venda), venda.Valor, "O valor da venda não pode ser negativo.");

        return venda;
    }
}
