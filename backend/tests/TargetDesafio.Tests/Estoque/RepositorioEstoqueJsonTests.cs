using TargetDesafio.Core.Estoque;

namespace TargetDesafio.Tests.Estoque;

public sealed class RepositorioEstoqueJsonTests : IDisposable
{
    private readonly string _diretorio = Path.Combine(Path.GetTempPath(), "target-estoque-" + Guid.NewGuid().ToString("N"));
    private readonly string _caminhoInicial = Path.Combine(AppContext.BaseDirectory, "data", "estoque.json");

    private string CaminhoEstado => Path.Combine(_diretorio, "runtime", "estoque-estado.json");

    [Fact]
    public void PrimeiraExecucao_CarregaProdutosDoArquivoInicial()
    {
        var estado = new RepositorioEstoqueJson(CaminhoEstado, _caminhoInicial).Carregar();

        Assert.Equal(5, estado.Produtos.Count);
        Assert.Empty(estado.Movimentacoes);
        Assert.False(File.Exists(CaminhoEstado));
    }

    [Fact]
    public void EstadoPersistido_SobreviveAoReinicio()
    {
        var servico = new ServicoEstoque(new RepositorioEstoqueJson(CaminhoEstado, _caminhoInicial));
        servico.Movimentar(new(103, TipoMovimentacao.Saida, 50, "Venda"));

        // Simula reinício da aplicação: nova instância lendo o mesmo arquivo.
        var reiniciado = new ServicoEstoque(new RepositorioEstoqueJson(CaminhoEstado, _caminhoInicial));
        var proxima = reiniciado.Movimentar(new(103, TipoMovimentacao.Entrada, 10, "Compra"));

        Assert.True(File.Exists(CaminhoEstado));
        Assert.Equal(2, proxima.Movimentacao.Id);
        Assert.Equal(160, proxima.EstoqueFinal); // 200 - 50 + 10
        Assert.Equal(2, reiniciado.ListarMovimentacoes(103).Count);
        Assert.Equal(TipoMovimentacao.Saida, reiniciado.ListarMovimentacoes()[1].Tipo);
    }

    public void Dispose()
    {
        if (Directory.Exists(_diretorio))
            Directory.Delete(_diretorio, recursive: true);
    }
}
