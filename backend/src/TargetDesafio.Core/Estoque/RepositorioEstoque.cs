using System.Text.Json;
using System.Text.Json.Serialization;

namespace TargetDesafio.Core.Estoque;

/// <summary>
/// Estado completo do estoque: produtos, histórico e último ID gerado.
/// </summary>
public sealed class EstadoEstoque
{
    public List<Produto> Produtos { get; init; } = [];
    public List<Movimentacao> Movimentacoes { get; init; } = [];
    public int UltimoId { get; set; }
}

/// <summary>
/// Persistência do estado do estoque.
/// </summary>
public interface IRepositorioEstoque
{
    EstadoEstoque Carregar();
    void Salvar(EstadoEstoque estado);
}

/// <summary>
/// Mantém o estado apenas em memória (útil para testes).
/// </summary>
public sealed class RepositorioEstoqueMemoria(IEnumerable<Produto> produtosIniciais) : IRepositorioEstoque
{
    private readonly List<Produto> _produtosIniciais = produtosIniciais.ToList();

    /// <summary>Quantas vezes o estado foi salvo.</summary>
    public int Salvamentos { get; private set; }

    public EstadoEstoque Carregar() => new() { Produtos = _produtosIniciais.ToList() };

    public void Salvar(EstadoEstoque estado) => Salvamentos++;
}

/// <summary>
/// Persiste o estado em um arquivo JSON. Na primeira execução, os produtos
/// vêm do arquivo de estoque inicial (formato do enunciado).
/// </summary>
public sealed class RepositorioEstoqueJson(string caminhoEstado, string caminhoEstoqueInicial) : IRepositorioEstoque
{
    private static readonly JsonSerializerOptions Opcoes = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public EstadoEstoque Carregar()
    {
        if (File.Exists(caminhoEstado))
        {
            var json = File.ReadAllText(caminhoEstado);
            return JsonSerializer.Deserialize<EstadoEstoque>(json, Opcoes)
                ?? throw new InvalidDataException($"Arquivo de estado inválido: {caminhoEstado}");
        }

        return new EstadoEstoque { Produtos = LeitorEstoqueJson.LerArquivo(caminhoEstoqueInicial).ToList() };
    }

    public void Salvar(EstadoEstoque estado)
    {
        var diretorio = Path.GetDirectoryName(Path.GetFullPath(caminhoEstado));
        if (!string.IsNullOrEmpty(diretorio))
            Directory.CreateDirectory(diretorio);

        // Grava em arquivo temporário e substitui, para não corromper o estado se algo falhar no meio.
        var temporario = caminhoEstado + ".tmp";
        File.WriteAllText(temporario, JsonSerializer.Serialize(estado, Opcoes));
        File.Move(temporario, caminhoEstado, overwrite: true);
    }
}
