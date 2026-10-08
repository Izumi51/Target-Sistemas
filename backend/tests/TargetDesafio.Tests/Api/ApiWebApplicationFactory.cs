using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TargetDesafio.Core.Estoque;

namespace TargetDesafio.Tests.Api;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    public static readonly DateTimeOffset DataFixo = new(2026, 10, 7, 12, 0, 0, TimeSpan.Zero);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove repositório e tempo de produção para testes isolados e determinísticos
            var descritorRepo = services.SingleOrDefault(d => d.ServiceType == typeof(IRepositorioEstoque));
            if (descritorRepo != null) services.Remove(descritorRepo);

            var descritorServico = services.SingleOrDefault(d => d.ServiceType == typeof(ServicoEstoque));
            if (descritorServico != null) services.Remove(descritorServico);

            var descritorTempo = services.SingleOrDefault(d => d.ServiceType == typeof(TimeProvider));
            if (descritorTempo != null) services.Remove(descritorTempo);

            var relogio = new RelogioFixo(DataFixo);
            services.AddSingleton<TimeProvider>(relogio);

            var produtosIniciais = new List<Produto>
            {
                new(101, "Caneta Azul", 150),
                new(102, "Caderno Universitário", 75),
                new(103, "Borracha Branca", 200),
                new(104, "Lápis Preto HB", 320),
                new(105, "Marcador de Texto Amarelo", 90)
            };

            var repoMemoria = new RepositorioEstoqueMemoria(produtosIniciais);
            services.AddSingleton<IRepositorioEstoque>(repoMemoria);
            services.AddSingleton(new ServicoEstoque(repoMemoria, relogio));
        });
    }
}
