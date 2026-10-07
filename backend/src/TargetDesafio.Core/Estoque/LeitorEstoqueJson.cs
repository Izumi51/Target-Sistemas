using System.Text.Json;

namespace TargetDesafio.Core.Estoque;

/// <summary>
/// Lê o estoque inicial no formato do enunciado:
/// <c>{ "estoque": [ { "codigoProduto": 101, "descricaoProduto": "...", "estoque": 150 } ] }</c>.
/// </summary>
public static class LeitorEstoqueJson
{
    private static readonly JsonSerializerOptions Opcoes = new(JsonSerializerDefaults.Web);

    private sealed record ArquivoEstoque(List<Produto>? Estoque);

    public static IReadOnlyList<Produto> Desserializar(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        var arquivo = JsonSerializer.Deserialize<ArquivoEstoque>(json, Opcoes)
            ?? throw new InvalidDataException("JSON de estoque vazio ou inválido.");

        var produtos = arquivo.Estoque
            ?? throw new InvalidDataException("O JSON não contém a propriedade \"estoque\".");

        foreach (var p in produtos)
        {
            if (string.IsNullOrWhiteSpace(p.DescricaoProduto))
                throw new InvalidDataException($"Produto {p.CodigoProduto} sem descrição.");
            if (p.Estoque < 0)
                throw new InvalidDataException($"Produto {p.CodigoProduto} com estoque negativo.");
        }

        var duplicado = produtos.GroupBy(p => p.CodigoProduto).FirstOrDefault(g => g.Count() > 1);
        if (duplicado is not null)
            throw new InvalidDataException($"Código de produto duplicado: {duplicado.Key}.");

        return produtos;
    }

    public static IReadOnlyList<Produto> LerArquivo(string caminho) =>
        Desserializar(File.ReadAllText(caminho));
}
