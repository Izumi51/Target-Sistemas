using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Diagnostics;
using TargetDesafio.Api.Configuracao;
using TargetDesafio.Api.Endpoints;
using TargetDesafio.Core.Comissao;
using TargetDesafio.Core.Estoque;
using TargetDesafio.Core.Juros;

var builder = WebApplication.CreateBuilder(args);

// Configuração de arquivos de dados
var configDados = builder.Configuration
    .GetSection(ConfiguracaoDados.Secao)
    .Get<ConfiguracaoDados>() ?? new ConfiguracaoDados();
builder.Services.AddSingleton(configDados);

// Conversão de enums como strings no JSON (ex.: "Entrada", "Saida")
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Target Sistemas - Desafio Dev API",
        Version = "v1",
        Description = "API REST com serviços de cálculo de comissões comerciais, controle de estoque do depósito e cálculo de juros por atraso."
    });
});

// CORS para o frontend Angular (ng serve em localhost:4200)
const string CorsAngular = "Angular";
builder.Services.AddCors(options =>
    options.AddPolicy(CorsAngular, policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()));

// Tratamento de erros RFC 7807 ProblemDetails
builder.Services.AddProblemDetails();

// Injeção de dependências do Core
builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);
builder.Services.AddSingleton<CalculadoraComissao>();
builder.Services.AddSingleton(sp => new CalculadoraJuros(sp.GetRequiredService<TimeProvider>()));

builder.Services.AddSingleton<IRepositorioEstoque>(sp =>
{
    var config = sp.GetRequiredService<ConfiguracaoDados>();
    var env = sp.GetRequiredService<IHostEnvironment>();
    var caminhoInicial = config.ResolverCaminho(config.EstoqueInicialJson, env.ContentRootPath);
    var caminhoEstado = config.ResolverCaminho(config.EstoqueEstadoJson, env.ContentRootPath);
    return new RepositorioEstoqueJson(caminhoEstado, caminhoInicial);
});

builder.Services.AddSingleton(sp =>
{
    var repositorio = sp.GetRequiredService<IRepositorioEstoque>();
    var tempo = sp.GetRequiredService<TimeProvider>();
    return new ServicoEstoque(repositorio, tempo);
});

var app = builder.Build();

// Tratamento global de exceções mapeando para ProblemDetails
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        if (exception is EstoqueInsuficienteException insuficiente)
        {
            var problem = Results.ValidationProblem(
                new Dictionary<string, string[]>(insuficiente.Erros),
                title: "Estoque insuficiente",
                detail: insuficiente.Message);
            await problem.ExecuteAsync(context);
        }
        else if (exception is ValidacaoException validacao)
        {
            var problem = Results.ValidationProblem(
                new Dictionary<string, string[]>(validacao.Erros),
                title: "Erro de validação",
                detail: validacao.Message);
            await problem.ExecuteAsync(context);
        }
        else if (exception is ProdutoNaoEncontradoException produtoNaoEncontrado)
        {
            var problem = Results.Problem(
                title: "Produto não encontrado",
                detail: produtoNaoEncontrado.Message,
                statusCode: StatusCodes.Status404NotFound);
            await problem.ExecuteAsync(context);
        }
        else if (exception is ArgumentOutOfRangeException outOfRange)
        {
            var param = outOfRange.ParamName ?? "parametro";
            var problem = Results.ValidationProblem(
                new Dictionary<string, string[]> { [param] = [outOfRange.Message] },
                title: "Parâmetro inválido",
                detail: outOfRange.Message);
            await problem.ExecuteAsync(context);
        }
        else if (exception is ArgumentException argEx)
        {
            var param = argEx.ParamName ?? "parametro";
            var problem = Results.ValidationProblem(
                new Dictionary<string, string[]> { [param] = [argEx.Message] },
                title: "Parâmetro inválido",
                detail: argEx.Message);
            await problem.ExecuteAsync(context);
        }
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Target Desafio API v1");
    });
}

app.UseCors(CorsAngular);

// Endpoint de diagnóstico
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", dataHora = DateTimeOffset.UtcNow }))
   .WithName("Health")
   .WithTags("Diagnóstico")
   .WithSummary("Verifica a saúde da API")
   .WithOpenApi();

// Endpoints da aplicação
app.MapComissoesEndpoints();
app.MapEstoqueEndpoints();
app.MapJurosEndpoints();

app.Run();

// Necessário para os testes de integração com WebApplicationFactory
public partial class Program { }
