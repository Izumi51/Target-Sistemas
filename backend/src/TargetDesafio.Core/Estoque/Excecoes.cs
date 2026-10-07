namespace TargetDesafio.Core.Estoque;

/// <summary>
/// Erro de validação de entrada. A API converte em 400 (ValidationProblemDetails).
/// </summary>
public class ValidacaoException : Exception
{
    /// <summary>Erros por campo (nome do campo em camelCase → mensagens).</summary>
    public IReadOnlyDictionary<string, string[]> Erros { get; }

    public ValidacaoException(IDictionary<string, string[]> erros)
        : base(string.Join(" ", erros.SelectMany(e => e.Value)))
    {
        Erros = new Dictionary<string, string[]>(erros);
    }

    public ValidacaoException(string campo, string mensagem)
        : this(new Dictionary<string, string[]> { [campo] = [mensagem] })
    {
    }
}

/// <summary>
/// Saída maior que o saldo disponível do produto.
/// </summary>
public sealed class EstoqueInsuficienteException(Produto produto, int quantidadeSolicitada)
    : ValidacaoException("quantidade",
        $"Estoque insuficiente para \"{produto.DescricaoProduto}\": saldo atual {produto.Estoque}, saída solicitada {quantidadeSolicitada}.")
{
    public int CodigoProduto { get; } = produto.CodigoProduto;
    public int SaldoAtual { get; } = produto.Estoque;
    public int QuantidadeSolicitada { get; } = quantidadeSolicitada;
}

/// <summary>
/// Produto não cadastrado. A API converte em 404.
/// </summary>
public sealed class ProdutoNaoEncontradoException(int codigoProduto)
    : Exception($"Produto {codigoProduto} não encontrado.")
{
    public int CodigoProduto { get; } = codigoProduto;
}
