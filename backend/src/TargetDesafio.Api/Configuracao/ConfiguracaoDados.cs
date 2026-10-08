namespace TargetDesafio.Api.Configuracao;

/// <summary>
/// Caminhos dos arquivos de dados utilizados pela aplicação.
/// </summary>
public sealed class ConfiguracaoDados
{
    public const string Secao = "ArquivosDados";

    public string VendasJson { get; set; } = "data/vendas.json";
    public string EstoqueInicialJson { get; set; } = "data/estoque.json";
    public string EstoqueEstadoJson { get; set; } = "data/estoque-estado.json";

    /// <summary>
    /// Resolve o caminho absoluto de um arquivo a partir da raiz do conteúdo ou do diretório base da aplicação.
    /// </summary>
    public string ResolverCaminho(string caminhoRelativo, string raizConteudo)
    {
        if (Path.IsPathRooted(caminhoRelativo))
            return caminhoRelativo;

        var caminhoNaRaiz = Path.Combine(raizConteudo, caminhoRelativo);
        if (File.Exists(caminhoNaRaiz))
            return Path.GetFullPath(caminhoNaRaiz);

        var caminhoNaBase = Path.Combine(AppContext.BaseDirectory, caminhoRelativo);
        if (File.Exists(caminhoNaBase))
            return Path.GetFullPath(caminhoNaBase);

        // Fallback: se for criação de novo arquivo (como estado), usa caminho relativo à raiz do conteúdo
        return Path.GetFullPath(caminhoNaRaiz);
    }
}
