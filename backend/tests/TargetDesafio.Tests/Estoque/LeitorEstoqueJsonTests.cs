using TargetDesafio.Core.Estoque;

namespace TargetDesafio.Tests.Estoque;

public class LeitorEstoqueJsonTests
{
    [Fact]
    public void LerArquivo_DadosDoEnunciado()
    {
        var produtos = LeitorEstoqueJson.LerArquivo(Path.Combine(AppContext.BaseDirectory, "data", "estoque.json"));

        Assert.Equal(5, produtos.Count);
        Assert.Equal(new Produto(101, "Caneta Azul", 150), produtos[0]);
        Assert.Equal(new Produto(105, "Marcador de Texto Amarelo", 90), produtos[4]);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("""{ "estoque": [ { "codigoProduto": 1, "descricaoProduto": "A", "estoque": 1 }, { "codigoProduto": 1, "descricaoProduto": "B", "estoque": 2 } ] }""")]
    [InlineData("""{ "estoque": [ { "codigoProduto": 1, "descricaoProduto": "A", "estoque": -1 } ] }""")]
    [InlineData("""{ "estoque": [ { "codigoProduto": 1, "descricaoProduto": "", "estoque": 1 } ] }""")]
    public void Desserializar_DadosInconsistentes_LancaExcecao(string json)
    {
        Assert.Throws<InvalidDataException>(() => LeitorEstoqueJson.Desserializar(json));
    }
}
