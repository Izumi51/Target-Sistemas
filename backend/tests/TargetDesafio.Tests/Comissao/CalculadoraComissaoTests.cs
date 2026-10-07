using TargetDesafio.Core.Comissao;

namespace TargetDesafio.Tests.Comissao;

public class CalculadoraComissaoTests
{
    private readonly CalculadoraComissao _calculadora = new();

    [Fact]
    public void Calcular_AgrupaPorVendedorESomaComissoes()
    {
        var vendas = new[]
        {
            new Venda("Ana", 50m),     // 0
            new Venda("Ana", 200m),    // 2,00
            new Venda("Bruno", 1000m), // 50,00
            new Venda("Ana", 600m),    // 30,00
        };

        var resumo = _calculadora.Calcular(vendas);

        Assert.Equal(2, resumo.Vendedores.Count);

        var bruno = resumo.Vendedores[0];
        Assert.Equal("Bruno", bruno.Vendedor);
        Assert.Equal(1, bruno.QuantidadeVendas);
        Assert.Equal(50.00m, bruno.TotalComissao);

        var ana = resumo.Vendedores[1];
        Assert.Equal("Ana", ana.Vendedor);
        Assert.Equal(3, ana.QuantidadeVendas);
        Assert.Equal(850m, ana.TotalVendido);
        Assert.Equal(32.00m, ana.TotalComissao);
        Assert.Equal(new[] { 0m, 0.01m, 0.05m }, ana.Vendas.Select(v => v.Percentual));

        Assert.Equal(1850m, resumo.TotalVendido);
        Assert.Equal(82.00m, resumo.TotalComissao);
    }

    [Fact]
    public void Calcular_OrdenaPelaMaiorComissao()
    {
        var vendas = new[]
        {
            new Venda("Pequeno", 150m),
            new Venda("Grande", 5000m),
            new Venda("Medio", 700m),
        };

        var nomes = _calculadora.Calcular(vendas).Vendedores.Select(v => v.Vendedor);

        Assert.Equal(new[] { "Grande", "Medio", "Pequeno" }, nomes);
    }

    [Fact]
    public void Calcular_NomesComEspacosExtras_SaoAgrupadosJuntos()
    {
        var vendas = new[] { new Venda("Ana", 100m), new Venda(" Ana ", 100m) };

        var resumo = _calculadora.Calcular(vendas);

        Assert.Single(resumo.Vendedores);
        Assert.Equal("Ana", resumo.Vendedores[0].Vendedor);
    }

    [Fact]
    public void Calcular_ListaVazia_RetornaResumoZerado()
    {
        var resumo = _calculadora.Calcular(Array.Empty<Venda>());

        Assert.Empty(resumo.Vendedores);
        Assert.Equal(0m, resumo.TotalVendido);
        Assert.Equal(0m, resumo.TotalComissao);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Calcular_VendedorVazio_LancaExcecao(string vendedor)
    {
        Assert.Throws<ArgumentException>(() => _calculadora.Calcular(new[] { new Venda(vendedor, 100m) }));
    }

    [Fact]
    public void Calcular_ValorNegativo_LancaExcecao()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => _calculadora.Calcular(new[] { new Venda("Ana", -1m) }));
    }

    [Fact]
    public async Task Calcular_ComDadosDoEnunciado_RetornaComissoesEsperadas()
    {
        var caminho = Path.Combine(AppContext.BaseDirectory, "data", "vendas.json");
        var vendas = await LeitorVendasJson.LerArquivoAsync(caminho);

        var resumo = _calculadora.Calcular(vendas);

        Assert.Equal(36, vendas.Count);
        Assert.Collection(resumo.Vendedores,
            v => AssertVendedor(v, "João Silva", 10, 495.69m),
            v => AssertVendedor(v, "Maria Souza", 9, 465.96m),
            v => AssertVendedor(v, "Ana Lima", 9, 404.99m),
            v => AssertVendedor(v, "Carlos Oliveira", 8, 379.38m));
        Assert.Equal(1746.02m, resumo.TotalComissao);
    }

    private static void AssertVendedor(ComissaoVendedor v, string nome, int qtd, decimal comissao)
    {
        Assert.Equal(nome, v.Vendedor);
        Assert.Equal(qtd, v.QuantidadeVendas);
        Assert.Equal(comissao, v.TotalComissao);
    }
}
