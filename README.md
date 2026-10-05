# Desafio Técnico – Target Sistemas

Solução full stack para o [desafio técnico](desafio_dev.md):

1. **Comissões** – cálculo de comissão por vendedor a partir de um JSON de vendas.
2. **Estoque** – lançamento de movimentações (entrada/saída) com retorno do estoque final.
3. **Juros** – cálculo de juros por atraso (2,5% ao dia) a partir de valor e vencimento.

## Stack

| Camada | Tecnologia |
|---|---|
| Regras de negócio | C# 12 / .NET 8 (`TargetDesafio.Core`) |
| API REST | ASP.NET Core Minimal API + Swagger (`TargetDesafio.Api`) |
| Testes | xUnit (`TargetDesafio.Tests`) |
| Frontend | Angular *(em desenvolvimento)* |

## Estrutura

```
plantao/
├─ backend/
│  ├─ data/            # vendas.json, estoque.json (dados do enunciado)
│  ├─ src/
│  │  ├─ TargetDesafio.Core/
│  │  └─ TargetDesafio.Api/
│  └─ tests/
│     └─ TargetDesafio.Tests/
└─ frontend/           # Angular (próximas etapas)
```

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) (para o frontend)

## Como executar

```bash
cd backend
dotnet build
dotnet test
dotnet run --project src/TargetDesafio.Api
```

> Instruções completas (API + Angular) serão adicionadas conforme as etapas forem concluídas.
