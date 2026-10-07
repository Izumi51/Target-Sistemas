namespace TargetDesafio.Core.Juros;

/// <summary>
/// Calcula os juros de um título a partir do valor e da data de vencimento,
/// considerando juros simples de 2,5% por dia de atraso até a data de hoje:
/// <code>
/// diasAtraso = max(0, hoje - vencimento)
/// juros      = valor × 0,025 × diasAtraso
/// total      = valor + juros
/// </code>
/// </summary>
/// <remarks>
/// A data de hoje vem do <see cref="TimeProvider"/> (no fuso local), assim os testes
/// não dependem do dia em que rodam.
/// </remarks>
public sealed class CalculadoraJuros
{
    public const decimal TaxaDiaria = 0.025m;

    private readonly TimeProvider _tempo;

    public CalculadoraJuros(TimeProvider? tempo = null)
    {
        _tempo = tempo ?? TimeProvider.System;
    }

    /// <summary>Data de hoje no fuso local do <see cref="TimeProvider"/>.</summary>
    public DateOnly Hoje => DateOnly.FromDateTime(_tempo.GetLocalNow().DateTime);

    /// <summary>
    /// Calcula os juros do título na data de hoje.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">Quando o valor não é positivo ou é grande demais.</exception>
    public ResultadoJuros Calcular(decimal valor, DateOnly vencimento)
    {
        if (valor <= 0)
            throw new ArgumentOutOfRangeException(nameof(valor), valor, "O valor deve ser maior que zero.");

        var hoje = Hoje;
        var diasAtraso = Math.Max(0, hoje.DayNumber - vencimento.DayNumber);

        decimal juros, total;
        try
        {
            juros = Arredondar(valor * TaxaDiaria * diasAtraso);
            total = Arredondar(valor + juros);
        }
        catch (OverflowException ex)
        {
            throw new ArgumentOutOfRangeException(nameof(valor), valor,
                $"O valor é grande demais para o cálculo. {ex.Message}");
        }

        return new ResultadoJuros(valor, vencimento, hoje, diasAtraso, TaxaDiaria, juros, total);
    }

    private static decimal Arredondar(decimal valor) =>
        Math.Round(valor, 2, MidpointRounding.AwayFromZero);
}
