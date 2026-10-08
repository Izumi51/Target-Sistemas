using System.Net;
using System.Net.Http.Json;
using TargetDesafio.Core.Comissao;
using TargetDesafio.Core.Estoque;
using TargetDesafio.Core.Juros;

namespace TargetDesafio.Tests.Api;

public class ApiEndpointsTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ApiEndpointsTests(ApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_Retorna200OkComStatusOk()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"status\":\"ok\"", json);
    }

    [Fact]
    public async Task Comissoes_Retorna200OkComResumoDosVendedores()
    {
        var response = await _client.GetAsync("/api/comissoes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var resumo = await response.Content.ReadFromJsonAsync<ResumoComissoes>();

        Assert.NotNull(resumo);
        Assert.True(resumo.TotalVendido > 0);
        Assert.True(resumo.TotalComissao > 0);
        Assert.NotEmpty(resumo.Vendedores);
        Assert.Contains(resumo.Vendedores, v => v.Vendedor == "João Silva");
    }

    [Fact]
    public async Task Estoque_ListarProdutos_Retorna200OkComProdutos()
    {
        var response = await _client.GetAsync("/api/estoque/produtos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var produtos = await response.Content.ReadFromJsonAsync<List<Produto>>();

        Assert.NotNull(produtos);
        Assert.NotEmpty(produtos);
        Assert.Contains(produtos, p => p.CodigoProduto == 101);
    }

    [Fact]
    public async Task Estoque_ListarMovimentacoes_ProdutoInexistente_Retorna404()
    {
        var response = await _client.GetAsync("/api/estoque/movimentacoes?codigoProduto=9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Estoque_LancarMovimentacao_EntradaValida_Retorna201ComEstoqueFinal()
    {
        var payload = new
        {
            codigoProduto = 101,
            tipo = "Entrada",
            quantidade = 20,
            descricao = "Recebimento lote"
        };

        var response = await _client.PostAsJsonAsync("/api/estoque/movimentacoes", payload);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var resultado = await response.Content.ReadFromJsonAsync<ResultadoMovimentacao>();

        Assert.NotNull(resultado);
        Assert.Equal(101, resultado.Movimentacao.CodigoProduto);
        Assert.Equal(TipoMovimentacao.Entrada, resultado.Movimentacao.Tipo);
        Assert.Equal(20, resultado.Movimentacao.Quantidade);
        Assert.True(resultado.EstoqueFinal > resultado.Movimentacao.EstoqueAnterior);
    }

    [Fact]
    public async Task Estoque_LancarMovimentacao_SaidaAcimaDoSaldo_Retorna400ProblemDetails()
    {
        var payload = new
        {
            codigoProduto = 102,
            tipo = "Saida",
            quantidade = 9999,
            descricao = "Saída excessiva"
        };

        var response = await _client.PostAsJsonAsync("/api/estoque/movimentacoes", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var corpo = await response.Content.ReadAsStringAsync();
        Assert.Contains("Estoque insuficiente", corpo);
    }

    [Fact]
    public async Task Estoque_LancarMovimentacao_DadosInvalidos_Retorna400()
    {
        var payload = new
        {
            codigoProduto = 101,
            tipo = "Entrada",
            quantidade = -5,
            descricao = ""
        };

        var response = await _client.PostAsJsonAsync("/api/estoque/movimentacoes", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Estoque_LancarMovimentacao_ProdutoInexistente_Retorna404()
    {
        var payload = new
        {
            codigoProduto = 8888,
            tipo = "Entrada",
            quantidade = 10,
            descricao = "Item novo"
        };

        var response = await _client.PostAsJsonAsync("/api/estoque/movimentacoes", payload);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Juros_CalculoComAtraso_Retorna200Ok()
    {
        // Data fixada no factory: 2026-10-07. Vencimento: 2026-10-06 -> 1 dia de atraso.
        var response = await _client.GetAsync("/api/juros?valor=100.00&vencimento=2026-10-06");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var resultado = await response.Content.ReadFromJsonAsync<ResultadoJuros>();

        Assert.NotNull(resultado);
        Assert.Equal(100.00m, resultado.Valor);
        Assert.Equal(1, resultado.DiasAtraso);
        Assert.Equal(2.50m, resultado.Juros);
        Assert.Equal(102.50m, resultado.Total);
        Assert.True(resultado.Vencido);
    }

    [Fact]
    public async Task Juros_VencimentoHoje_RetornaZeroJuros()
    {
        var response = await _client.GetAsync("/api/juros?valor=200.00&vencimento=2026-10-07");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var resultado = await response.Content.ReadFromJsonAsync<ResultadoJuros>();

        Assert.NotNull(resultado);
        Assert.Equal(0, resultado.DiasAtraso);
        Assert.Equal(0.00m, resultado.Juros);
        Assert.Equal(200.00m, resultado.Total);
        Assert.False(resultado.Vencido);
    }

    [Fact]
    public async Task Juros_ParametrosAusentes_Retorna400ProblemDetails()
    {
        var response = await _client.GetAsync("/api/juros");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var corpo = await response.Content.ReadAsStringAsync();
        Assert.Contains("valor", corpo);
        Assert.Contains("vencimento", corpo);
    }

    [Fact]
    public async Task Juros_ValorNegativo_Retorna400()
    {
        var response = await _client.GetAsync("/api/juros?valor=-50&vencimento=2026-10-01");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
