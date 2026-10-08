using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TargetDesafio.Core.Estoque;

namespace TargetDesafio.Api.Endpoints;

public static class EstoqueEndpoints
{
    public static IEndpointRouteBuilder MapEstoqueEndpoints(this IEndpointRouteBuilder routes)
    {
        var grupo = routes.MapGroup("/api/estoque")
            .WithTags("Estoque");

        grupo.MapGet("/produtos", (ServicoEstoque servico) =>
        {
            var produtos = servico.ListarProdutos();
            return TypedResults.Ok(produtos);
        })
        .WithName("ListarProdutos")
        .WithSummary("Lista todos os produtos com seu respectivo saldo em estoque")
        .WithDescription("Retorna a lista ordenada dos produtos com código, descrição e quantidade atual em estoque.")
        .Produces<IReadOnlyList<Produto>>(StatusCodes.Status200OK)
        .WithOpenApi();

        grupo.MapGet("/movimentacoes", Results<Ok<IReadOnlyList<Movimentacao>>, ProblemHttpResult> (
            ServicoEstoque servico,
            [FromQuery] int? codigoProduto) =>
        {
            try
            {
                var historico = servico.ListarMovimentacoes(codigoProduto);
                return TypedResults.Ok(historico);
            }
            catch (ProdutoNaoEncontradoException ex)
            {
                return TypedResults.Problem(
                    title: "Produto não encontrado",
                    detail: ex.Message,
                    statusCode: StatusCodes.Status404NotFound);
            }
        })
        .WithName("ListarMovimentacoes")
        .WithSummary("Lista o histórico de movimentações de estoque")
        .WithDescription("Retorna todas as movimentações ou filtra por código do produto se informado. Ordenado por id decrescente.")
        .Produces<IReadOnlyList<Movimentacao>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithOpenApi();

        grupo.MapPost("/movimentacoes", Results<Created<ResultadoMovimentacao>, ValidationProblem, ProblemHttpResult> (
            ServicoEstoque servico,
            [FromBody] NovaMovimentacao nova) =>
        {
            try
            {
                var resultado = servico.Movimentar(nova);
                var uri = $"/api/estoque/movimentacoes?codigoProduto={resultado.Movimentacao.CodigoProduto}";
                return TypedResults.Created(uri, resultado);
            }
            catch (EstoqueInsuficienteException ex)
            {
                return TypedResults.ValidationProblem(
                    new Dictionary<string, string[]>(ex.Erros),
                    title: "Estoque insuficiente",
                    detail: ex.Message);
            }
            catch (ValidacaoException ex)
            {
                return TypedResults.ValidationProblem(
                    new Dictionary<string, string[]>(ex.Erros),
                    title: "Erro de validação",
                    detail: ex.Message);
            }
            catch (ProdutoNaoEncontradoException ex)
            {
                return TypedResults.Problem(
                    title: "Produto não encontrado",
                    detail: ex.Message,
                    statusCode: StatusCodes.Status404NotFound);
            }
        })
        .WithName("LancarMovimentacao")
        .WithSummary("Lança uma movimentação de estoque (Entrada ou Saída)")
        .WithDescription("Registra uma nova movimentação com id sequencial único e retorna a movimentação e o estoque final atualizado.")
        .Produces<ResultadoMovimentacao>(StatusCodes.Status201Created)
        .ProducesValidationProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithOpenApi();

        return routes;
    }
}
