using Microsoft.AspNetCore.Http.HttpResults;
using TargetDesafio.Api.Configuracao;
using TargetDesafio.Core.Comissao;

namespace TargetDesafio.Api.Endpoints;

public static class ComissoesEndpoints
{
    public static IEndpointRouteBuilder MapComissoesEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/comissoes", async Task<Results<Ok<ResumoComissoes>, ProblemHttpResult>> (
            CalculadoraComissao calculadora,
            ConfiguracaoDados config,
            IHostEnvironment env,
            CancellationToken ct) =>
        {
            var caminhoVendas = config.ResolverCaminho(config.VendasJson, env.ContentRootPath);

            if (!File.Exists(caminhoVendas))
            {
                return TypedResults.Problem(
                    title: "Arquivo de vendas não encontrado",
                    detail: $"Não foi possível localizar o arquivo de vendas em: {caminhoVendas}",
                    statusCode: StatusCodes.Status500InternalServerError);
            }

            var vendas = await LeitorVendasJson.LerArquivoAsync(caminhoVendas, ct);
            var resumo = calculadora.Calcular(vendas);
            return TypedResults.Ok(resumo);
        })
        .WithName("ObterComissoes")
        .WithTags("Comissões")
        .WithSummary("Resumo de comissões por vendedor e detalhes de cada venda")
        .WithDescription("Lê os registros de vendas comerciais, calcula as comissões por faixa e consolida os totais por vendedor.")
        .Produces<ResumoComissoes>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status500InternalServerError)
        .WithOpenApi();

        return routes;
    }
}
