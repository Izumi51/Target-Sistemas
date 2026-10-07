using TargetDesafio.Core.Juros;

namespace TargetDesafio.Tests.Juros;

public class CalculadoraJurosTests
{
    private static readonly DateOnly Hoje = new(2026, 10, 7);

    private static CalculadoraJuros CriarCalculadora() =>
        new(new RelogioFixo(new DateTimeOffset(2026, 10, 7, 12, 0, 0, TimeSpan.Zero)));

    [Fact]
    public void VencimentoHoje_NaoGeraJuros()
    {
        var resultado = CriarCalculadora().Calcular(100m, Hoje);

        Assert.Equal(0, resultado.DiasAtraso);
        Assert.Equal(0m, resultado.Juros);
        Assert.Equal(100m, resultado.Total);
        Assert.False(resultado.Vencido);
    }

    [Fact]
    public void VencimentoFuturo_NaoGeraJurosNemDiasNegativos()
    {
        var resultado = CriarCalculadora().Calcular(100m, Hoje.AddDays(5));

        Assert.Equal(0, resultado.DiasAtraso);
        Assert.Equal(0m, resultado.Juros);
        Assert.Equal(100m, resultado.Total);
        Assert.False(resultado.Vencido);
    }

    [Theory]
    [InlineData(1, "2.50", "102.50")]
    [InlineData(10, "25.00", "125.00")]
    [InlineData(40, "100.00", "200.00")]
    public void Atraso_AplicaJurosSimplesDe2Virgula5PorDia(int dias, string jurosEsperado, string totalEsperado)
    {
        var resultado = CriarCalculadora().Calcular(100m, Hoje.AddDays(-dias));

        Assert.Equal(dias, resultado.DiasAtraso);
        Assert.Equal(decimal.Parse(jurosEsperado, System.Globalization.CultureInfo.InvariantCulture), resultado.Juros);
        Assert.Equal(decimal.Parse(totalEsperado, System.Globalization.CultureInfo.InvariantCulture), resultado.Total);
        Assert.True(resultado.Vencido);
    }

    [Fact]
    public void Resultado_TrazDadosDoCalculo()
    {
        var vencimento = Hoje.AddDays(-3);

        var resultado = CriarCalculadora().Calcular(1500.75m, vencimento);

        Assert.Equal(1500.75m, resultado.Valor);
        Assert.Equal(vencimento, resultado.Vencimento);
        Assert.Equal(Hoje, resultado.DataCalculo);
        Assert.Equal(CalculadoraJuros.TaxaDiaria, resultado.TaxaDiaria);
        Assert.Equal(112.56m, resultado.Juros);   // 1500,75 × 0,025 × 3 = 112,55625
        Assert.Equal(1613.31m, resultado.Total);
    }

    [Fact]
    public void Juros_ArredondaMeioParaCima()
    {
        // 1,00 × 0,025 × 1 = 0,025 → 0,03 (arredondamento bancário daria 0,02)
        var resultado = CriarCalculadora().Calcular(1.00m, Hoje.AddDays(-1));

        Assert.Equal(0.03m, resultado.Juros);
        Assert.Equal(1.03m, resultado.Total);
    }

    [Fact]
    public void Hoje_UsaDataNoFusoLocal()
    {
        // 01:00 UTC do dia 07 ainda é 22:00 do dia 06 em Brasília (UTC-3).
        var brasilia = TimeZoneInfo.CreateCustomTimeZone("BRT", TimeSpan.FromHours(-3), "BRT", "BRT");
        var relogio = new RelogioFixo(new DateTimeOffset(2026, 10, 7, 1, 0, 0, TimeSpan.Zero), brasilia);

        var resultado = new CalculadoraJuros(relogio).Calcular(100m, new DateOnly(2026, 10, 5));

        Assert.Equal(new DateOnly(2026, 10, 6), resultado.DataCalculo);
        Assert.Equal(1, resultado.DiasAtraso);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-10.50")]
    public void ValorNaoPositivo_LancaExcecao(string valor)
    {
        var ex = Assert.Throws<ArgumentOutOfRangeException>(() =>
            CriarCalculadora().Calcular(decimal.Parse(valor, System.Globalization.CultureInfo.InvariantCulture), Hoje));

        Assert.Equal("valor", ex.ParamName);
    }

    [Fact]
    public void ValorGrandeDemais_LancaExcecaoEmVezDeOverflow()
    {
        var ex = Assert.Throws<ArgumentOutOfRangeException>(() =>
            CriarCalculadora().Calcular(decimal.MaxValue, DateOnly.MinValue));

        Assert.Equal("valor", ex.ParamName);
    }
}
