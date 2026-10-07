namespace TargetDesafio.Tests;

/// <summary>Relógio fixo para testes determinísticos.</summary>
/// <param name="agora">Instante retornado como "agora".</param>
/// <param name="fusoHorario">Fuso usado como horário local (padrão: UTC).</param>
internal sealed class RelogioFixo(DateTimeOffset agora, TimeZoneInfo? fusoHorario = null) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => agora.ToUniversalTime();
    public override TimeZoneInfo LocalTimeZone => fusoHorario ?? TimeZoneInfo.Utc;
}
