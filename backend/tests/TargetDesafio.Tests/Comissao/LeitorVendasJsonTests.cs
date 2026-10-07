using TargetDesafio.Core.Comissao;

namespace TargetDesafio.Tests.Comissao;

public class LeitorVendasJsonTests
{
    [Fact]
    public void Desserializar_FormatoDoEnunciado()
    {
        const string json = """
            { "vendas": [ { "vendedor": "João Silva", "valor": 1200.50 }, { "vendedor": "Ana Lima", "valor": 75.30 } ] }
            """;

        var vendas = LeitorVendasJson.Desserializar(json);

        Assert.Equal(new[] { new Venda("João Silva", 1200.50m), new Venda("Ana Lima", 75.30m) }, vendas);
    }

    [Fact]
    public void Desserializar_SemPropriedadeVendas_LancaExcecao()
    {
        Assert.Throws<InvalidDataException>(() => LeitorVendasJson.Desserializar("{}"));
    }
}
