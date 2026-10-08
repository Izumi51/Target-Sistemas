using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TargetDesafio.Core.Juros;

namespace TargetDesafio.Api.Endpoints;

public static class JurosEndpoints
{
    public static IEndpointRouteBuilder MapJurosEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/juros", Results<Ok<ResultadoJuros>, ValidationProblem> (
            CalculadoraJuros calculadora,
            [FromQuery] decimal? valor,
            [FromQuery] DateOnly? vencimento) =>
        {
            var erros = new Dictionary<string, string[]>();

            if (!valor.HasValue)
                erros["valor"] = ["O parâmetro 'valor' é obrigatório."];
            else if (valor.Value <= 0)
                erros["valor"] = ["O valor deve ser maior que zero."];

            if (!vencimento.HasValue)
                erros["vencimento"] = ["O parâmetro 'vencimento' é obrigatório no formato YYYY-MM-DD."];

            if (erros.Count > 0)
            {
                return TypedResults.ValidationProblem(
                    erros,
                    title: "Erro de validação",
                    detail: "Parâmetros inválidos para o cálculo de juros.");
            }

            try
            {
                var resultado = calculadora.Calcular(valor!.Value, vencimento!.Value);
                return TypedResults.Ok(resultado);
            }
            catch (ArgumentOutOfRangeException ex)
            {
                var campo = ex.ParamName ?? "valor";
                var errosEx = new Dictionary<string, string[]> { [campo] = [ex.Message] };
                return TypedResults.ValidationProblem(
                    errosEx,
                    title: "Parâmetro inválido",
                    detail: ex.Message);
            }
        })
        .WithName("CalcularJuros")
        .WithTags("Juros")
        .WithSummary("Calcula os juros de um título com taxa de 2,5% ao dia de atraso")
        .WithDescription("A partir de um valor e data de vencimento, calcula os dias de atraso na data atual, o valor dos juros e o total.")
        .Produces<ResultadoJuros>(StatusCodes.Status200OK)
        .ProducesValidationProblem(StatusCodes.Status400BadRequest)
        .WithOpenApi();

        return routes;
    }
}
