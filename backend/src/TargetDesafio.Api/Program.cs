var builder = WebApplication.CreateBuilder(args);

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS para o frontend Angular (ng serve)
const string CorsAngular = "Angular";
builder.Services.AddCors(options =>
    options.AddPolicy(CorsAngular, policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddProblemDetails();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsAngular);

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }))
   .WithName("Health")
   .WithOpenApi();

// Endpoints de Comissões, Estoque e Juros serão adicionados nas próximas etapas.

app.Run();
