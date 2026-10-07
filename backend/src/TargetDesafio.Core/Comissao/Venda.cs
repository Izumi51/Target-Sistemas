namespace TargetDesafio.Core.Comissao;

/// <summary>
/// Registro de uma venda realizada por um vendedor.
/// </summary>
/// <param name="Vendedor">Nome do vendedor responsável pela venda.</param>
/// <param name="Valor">Valor da venda em reais.</param>
public sealed record Venda(string Vendedor, decimal Valor);
