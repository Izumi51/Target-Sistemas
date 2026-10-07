using System.Text.Json;

namespace TargetDesafio.Core.Comissao;

/// <summary>
/// Lê as vendas no formato do enunciado: <c>{ "vendas": [ { "vendedor": "...", "valor": 0.0 } ] }</c>.
/// </summary>
public static class LeitorVendasJson
{
    private static readonly JsonSerializerOptions Opcoes = new(JsonSerializerDefaults.Web);

    private sealed record ArquivoVendas(List<Venda>? Vendas);

    public static IReadOnlyList<Venda> Desserializar(string json)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);

        var arquivo = JsonSerializer.Deserialize<ArquivoVendas>(json, Opcoes)
            ?? throw new InvalidDataException("JSON de vendas vazio ou inválido.");

        return arquivo.Vendas ?? throw new InvalidDataException("O JSON não contém a propriedade \"vendas\".");
    }

    public static async Task<IReadOnlyList<Venda>> LerArquivoAsync(string caminho, CancellationToken cancellationToken = default)
    {
        var json = await File.ReadAllTextAsync(caminho, cancellationToken);
        return Desserializar(json);
    }
}
