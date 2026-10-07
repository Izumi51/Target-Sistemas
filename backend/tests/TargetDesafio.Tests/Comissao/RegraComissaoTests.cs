using TargetDesafio.Core.Comissao;

namespace TargetDesafio.Tests.Comissao;

public class RegraComissaoTests
{
    [Theory]
    [InlineData(0.00, 0.00)]
    [InlineData(99.99, 0.00)]
    [InlineData(100.00, 0.01)]
    [InlineData(499.99, 0.01)]
    [InlineData(500.00, 0.05)]
    [InlineData(1800.00, 0.05)]
    public void ObterPercentual_RespeitaAsFaixas(decimal valor, decimal percentualEsperado)
    {
        Assert.Equal(percentualEsperado, RegraComissao.ObterPercentual(valor));
    }

    [Theory]
    [InlineData(90.75, 0.00)]     // abaixo de 100: sem comissão
    [InlineData(100.00, 1.00)]    // limite inferior da faixa de 1%
    [InlineData(250.30, 2.50)]    // 2,503   -> 2,50
    [InlineData(480.75, 4.81)]    // 4,8075  -> 4,81
    [InlineData(400.50, 4.01)]    // 4,005   -> 4,01 (meio para cima)
    [InlineData(500.00, 25.00)]   // limite inferior da faixa de 5%
    [InlineData(1200.50, 60.03)]  // 60,025  -> 60,03 (meio para cima)
    public void CalcularComissao_ArredondaEmDuasCasas(decimal valor, decimal comissaoEsperada)
    {
        Assert.Equal(comissaoEsperada, RegraComissao.CalcularComissao(valor));
    }

    [Fact]
    public void ObterPercentual_ValorNegativo_LancaExcecao()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => RegraComissao.ObterPercentual(-0.01m));
    }
}
