namespace TargetDesafio.Core.Estoque;

/// <summary>
/// Produto do depósito com seu saldo atual.
/// </summary>
/// <param name="CodigoProduto">Código único do produto.</param>
/// <param name="DescricaoProduto">Descrição do produto.</param>
/// <param name="Estoque">Quantidade atual em estoque.</param>
public sealed record Produto(int CodigoProduto, string DescricaoProduto, int Estoque);

/// <summary>
/// Tipo da movimentação de estoque.
/// </summary>
public enum TipoMovimentacao
{
    Entrada = 1,
    Saida = 2
}

/// <summary>
/// Movimentação registrada no estoque.
/// </summary>
/// <param name="Id">Identificador único e sequencial.</param>
/// <param name="CodigoProduto">Produto movimentado.</param>
/// <param name="Tipo">Entrada ou saída.</param>
/// <param name="Quantidade">Quantidade movimentada (sempre positiva).</param>
/// <param name="Descricao">Descrição informada para identificar a movimentação.</param>
/// <param name="DataHora">Momento do lançamento.</param>
/// <param name="EstoqueAnterior">Saldo do produto antes da movimentação.</param>
/// <param name="EstoqueFinal">Saldo do produto depois da movimentação.</param>
public sealed record Movimentacao(
    int Id,
    int CodigoProduto,
    TipoMovimentacao Tipo,
    int Quantidade,
    string Descricao,
    DateTimeOffset DataHora,
    int EstoqueAnterior,
    int EstoqueFinal);

/// <summary>
/// Dados para lançar uma nova movimentação.
/// </summary>
public sealed record NovaMovimentacao(int CodigoProduto, TipoMovimentacao Tipo, int Quantidade, string? Descricao);

/// <summary>
/// Resultado do lançamento: a movimentação criada e o produto com o saldo atualizado.
/// </summary>
public sealed record ResultadoMovimentacao(Movimentacao Movimentacao, Produto Produto)
{
    /// <summary>Quantidade final em estoque do produto movimentado.</summary>
    public int EstoqueFinal => Produto.Estoque;
}
