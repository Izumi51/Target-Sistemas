using TargetDesafio.Core.Estoque;

namespace TargetDesafio.Tests.Estoque;

/// <summary>Relógio fixo para testes determinísticos.</summary>
internal sealed class RelogioFixo(DateTimeOffset agora) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => agora.ToUniversalTime();
    public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;
}

public class ServicoEstoqueTests
{
    private static readonly DateTimeOffset Agora = new(2026, 10, 6, 15, 0, 0, TimeSpan.Zero);

    private readonly RepositorioEstoqueMemoria _repositorio = new(new[]
    {
        new Produto(101, "Caneta Azul", 150),
        new Produto(102, "Caderno Universitário", 75),
    });

    private ServicoEstoque CriarServico() => new(_repositorio, new RelogioFixo(Agora));

    [Fact]
    public void Entrada_SomaAoSaldoERetornaEstoqueFinal()
    {
        var resultado = CriarServico().Movimentar(new(101, TipoMovimentacao.Entrada, 10, "Compra fornecedor"));

        Assert.Equal(160, resultado.EstoqueFinal);
        Assert.Equal(150, resultado.Movimentacao.EstoqueAnterior);
        Assert.Equal(160, resultado.Movimentacao.EstoqueFinal);
    }

    [Fact]
    public void Saida_SubtraiDoSaldo()
    {
        var servico = CriarServico();

        var resultado = servico.Movimentar(new(102, TipoMovimentacao.Saida, 25, "Venda balcão"));

        Assert.Equal(50, resultado.EstoqueFinal);
        Assert.Equal(50, servico.ObterProduto(102).Estoque);
    }

    [Fact]
    public void Saida_DoSaldoExato_ZeraEstoque()
    {
        var resultado = CriarServico().Movimentar(new(102, TipoMovimentacao.Saida, 75, "Baixa total"));

        Assert.Equal(0, resultado.EstoqueFinal);
    }

    [Fact]
    public void Saida_AcimaDoSaldo_LancaExcecaoENaoAlteraNada()
    {
        var servico = CriarServico();

        var ex = Assert.Throws<EstoqueInsuficienteException>(() =>
            servico.Movimentar(new(102, TipoMovimentacao.Saida, 76, "Venda")));

        Assert.Equal(75, ex.SaldoAtual);
        Assert.Contains("quantidade", ex.Erros.Keys);
        Assert.Equal(75, servico.ObterProduto(102).Estoque);
        Assert.Empty(servico.ListarMovimentacoes());
        Assert.Equal(0, _repositorio.Salvamentos);
    }

    [Fact]
    public void ProdutoInexistente_LancaProdutoNaoEncontrado()
    {
        var ex = Assert.Throws<ProdutoNaoEncontradoException>(() =>
            CriarServico().Movimentar(new(999, TipoMovimentacao.Entrada, 1, "Teste")));

        Assert.Equal(999, ex.CodigoProduto);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void QuantidadeNaoPositiva_LancaValidacao(int quantidade)
    {
        var ex = Assert.Throws<ValidacaoException>(() =>
            CriarServico().Movimentar(new(101, TipoMovimentacao.Entrada, quantidade, "Teste")));

        Assert.Contains("quantidade", ex.Erros.Keys);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void DescricaoVazia_LancaValidacao(string? descricao)
    {
        var ex = Assert.Throws<ValidacaoException>(() =>
            CriarServico().Movimentar(new(101, TipoMovimentacao.Entrada, 1, descricao)));

        Assert.Contains("descricao", ex.Erros.Keys);
    }

    [Fact]
    public void DescricaoMuitoLonga_LancaValidacao()
    {
        var descricao = new string('x', ServicoEstoque.TamanhoMaximoDescricao + 1);

        var ex = Assert.Throws<ValidacaoException>(() =>
            CriarServico().Movimentar(new(101, TipoMovimentacao.Entrada, 1, descricao)));

        Assert.Contains("descricao", ex.Erros.Keys);
    }

    [Fact]
    public void TipoInvalido_LancaValidacao()
    {
        var ex = Assert.Throws<ValidacaoException>(() =>
            CriarServico().Movimentar(new(101, (TipoMovimentacao)99, 1, "Teste")));

        Assert.Contains("tipo", ex.Erros.Keys);
    }

    [Fact]
    public void VariosCamposInvalidos_RetornaTodosOsErros()
    {
        var ex = Assert.Throws<ValidacaoException>(() =>
            CriarServico().Movimentar(new(101, (TipoMovimentacao)0, 0, "")));

        Assert.Equal(new[] { "descricao", "quantidade", "tipo" }, ex.Erros.Keys.Order());
    }

    [Fact]
    public void Movimentacoes_RecebemIdsUnicosESequenciais()
    {
        var servico = CriarServico();

        var ids = new[]
        {
            servico.Movimentar(new(101, TipoMovimentacao.Entrada, 1, "A")).Movimentacao.Id,
            servico.Movimentar(new(102, TipoMovimentacao.Saida, 1, "B")).Movimentacao.Id,
            servico.Movimentar(new(101, TipoMovimentacao.Saida, 1, "C")).Movimentacao.Id,
        };

        Assert.Equal(new[] { 1, 2, 3 }, ids);
    }

    [Fact]
    public void Movimentacao_RegistraDescricaoNormalizadaEDataHoraDoRelogio()
    {
        var mov = CriarServico().Movimentar(new(101, TipoMovimentacao.Entrada, 5, "  Ajuste inventário  ")).Movimentacao;

        Assert.Equal("Ajuste inventário", mov.Descricao);
        Assert.Equal(Agora, mov.DataHora);
        Assert.Equal(TipoMovimentacao.Entrada, mov.Tipo);
        Assert.Equal(5, mov.Quantidade);
    }

    [Fact]
    public void ListarMovimentacoes_FiltraPorProdutoEOrdenaDaMaisRecente()
    {
        var servico = CriarServico();
        servico.Movimentar(new(101, TipoMovimentacao.Entrada, 1, "A"));
        servico.Movimentar(new(102, TipoMovimentacao.Entrada, 1, "B"));
        servico.Movimentar(new(101, TipoMovimentacao.Saida, 1, "C"));

        Assert.Equal(new[] { 3, 2, 1 }, servico.ListarMovimentacoes().Select(m => m.Id));
        Assert.Equal(new[] { 3, 1 }, servico.ListarMovimentacoes(101).Select(m => m.Id));
        Assert.Throws<ProdutoNaoEncontradoException>(() => servico.ListarMovimentacoes(999));
    }

    [Fact]
    public void CadaMovimentacaoValida_EhPersistida()
    {
        var servico = CriarServico();
        servico.Movimentar(new(101, TipoMovimentacao.Entrada, 1, "A"));
        servico.Movimentar(new(101, TipoMovimentacao.Entrada, 1, "B"));

        Assert.Equal(2, _repositorio.Salvamentos);
    }

    [Fact]
    public void FalhaAoSalvar_DesfazAlteracoesEmMemoria()
    {
        var servico = new ServicoEstoque(new RepositorioQueFalha(), new RelogioFixo(Agora));

        Assert.Throws<IOException>(() => servico.Movimentar(new(101, TipoMovimentacao.Entrada, 10, "A")));

        Assert.Equal(150, servico.ObterProduto(101).Estoque);
        Assert.Empty(servico.ListarMovimentacoes());
    }

    [Fact]
    public void ListarProdutos_RetornaOrdenadoPorCodigo()
    {
        var codigos = CriarServico().ListarProdutos().Select(p => p.CodigoProduto);

        Assert.Equal(new[] { 101, 102 }, codigos);
    }

    private sealed class RepositorioQueFalha : IRepositorioEstoque
    {
        public EstadoEstoque Carregar() => new() { Produtos = [new Produto(101, "Caneta Azul", 150)] };
        public void Salvar(EstadoEstoque estado) => throw new IOException("Disco cheio");
    }
}
