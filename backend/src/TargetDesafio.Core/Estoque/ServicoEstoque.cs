namespace TargetDesafio.Core.Estoque;

/// <summary>
/// Lança movimentações de entrada/saída e mantém o saldo dos produtos.
/// É thread-safe, para poder ser registrado como singleton na API.
/// </summary>
public sealed class ServicoEstoque
{
    public const int TamanhoMaximoDescricao = 200;

    private readonly IRepositorioEstoque _repositorio;
    private readonly TimeProvider _tempo;
    private readonly EstadoEstoque _estado;
    private readonly object _lock = new();

    public ServicoEstoque(IRepositorioEstoque repositorio, TimeProvider? tempo = null)
    {
        _repositorio = repositorio ?? throw new ArgumentNullException(nameof(repositorio));
        _tempo = tempo ?? TimeProvider.System;
        _estado = repositorio.Carregar();
    }

    public IReadOnlyList<Produto> ListarProdutos()
    {
        lock (_lock)
            return _estado.Produtos.OrderBy(p => p.CodigoProduto).ToList();
    }

    /// <exception cref="ProdutoNaoEncontradoException"/>
    public Produto ObterProduto(int codigoProduto)
    {
        lock (_lock)
            return _estado.Produtos[IndiceDoProduto(codigoProduto)];
    }

    /// <summary>
    /// Histórico de movimentações, da mais recente para a mais antiga.
    /// </summary>
    /// <exception cref="ProdutoNaoEncontradoException">Quando o filtro aponta para um produto inexistente.</exception>
    public IReadOnlyList<Movimentacao> ListarMovimentacoes(int? codigoProduto = null)
    {
        lock (_lock)
        {
            if (codigoProduto is int codigo)
                IndiceDoProduto(codigo);

            return _estado.Movimentacoes
                .Where(m => codigoProduto is null || m.CodigoProduto == codigoProduto)
                .OrderByDescending(m => m.Id)
                .ToList();
        }
    }

    /// <summary>
    /// Lança uma movimentação e retorna o estoque final do produto.
    /// </summary>
    /// <exception cref="ValidacaoException">Dados inválidos.</exception>
    /// <exception cref="EstoqueInsuficienteException">Saída maior que o saldo.</exception>
    /// <exception cref="ProdutoNaoEncontradoException">Produto não cadastrado.</exception>
    public ResultadoMovimentacao Movimentar(NovaMovimentacao nova)
    {
        ArgumentNullException.ThrowIfNull(nova);
        var descricao = Validar(nova);

        lock (_lock)
        {
            var indice = IndiceDoProduto(nova.CodigoProduto);
            var produto = _estado.Produtos[indice];

            long saldoFinal = nova.Tipo == TipoMovimentacao.Entrada
                ? (long)produto.Estoque + nova.Quantidade
                : (long)produto.Estoque - nova.Quantidade;

            if (saldoFinal < 0)
                throw new EstoqueInsuficienteException(produto, nova.Quantidade);
            if (saldoFinal > int.MaxValue)
                throw new ValidacaoException("quantidade", "A entrada ultrapassa o limite de estoque suportado.");

            var movimentacao = new Movimentacao(
                Id: _estado.UltimoId + 1,
                CodigoProduto: produto.CodigoProduto,
                Tipo: nova.Tipo,
                Quantidade: nova.Quantidade,
                Descricao: descricao,
                DataHora: _tempo.GetLocalNow(),
                EstoqueAnterior: produto.Estoque,
                EstoqueFinal: (int)saldoFinal);

            var produtoAtualizado = produto with { Estoque = movimentacao.EstoqueFinal };

            _estado.Produtos[indice] = produtoAtualizado;
            _estado.Movimentacoes.Add(movimentacao);
            _estado.UltimoId = movimentacao.Id;

            try
            {
                _repositorio.Salvar(_estado);
            }
            catch
            {
                // Desfaz em memória para manter consistência com o que está persistido.
                _estado.Produtos[indice] = produto;
                _estado.Movimentacoes.RemoveAt(_estado.Movimentacoes.Count - 1);
                _estado.UltimoId = movimentacao.Id - 1;
                throw;
            }

            return new ResultadoMovimentacao(movimentacao, produtoAtualizado);
        }
    }

    private int IndiceDoProduto(int codigoProduto)
    {
        var indice = _estado.Produtos.FindIndex(p => p.CodigoProduto == codigoProduto);
        return indice >= 0 ? indice : throw new ProdutoNaoEncontradoException(codigoProduto);
    }

    /// <summary>Valida os campos e retorna a descrição normalizada.</summary>
    private static string Validar(NovaMovimentacao nova)
    {
        var erros = new Dictionary<string, string[]>();
        var descricao = nova.Descricao?.Trim() ?? string.Empty;

        if (!Enum.IsDefined(nova.Tipo))
            erros["tipo"] = ["Tipo de movimentação inválido. Use Entrada ou Saida."];

        if (nova.Quantidade <= 0)
            erros["quantidade"] = ["A quantidade deve ser maior que zero."];

        if (descricao.Length == 0)
            erros["descricao"] = ["A descrição da movimentação é obrigatória."];
        else if (descricao.Length > TamanhoMaximoDescricao)
            erros["descricao"] = [$"A descrição deve ter no máximo {TamanhoMaximoDescricao} caracteres."];

        if (erros.Count > 0)
            throw new ValidacaoException(erros);

        return descricao;
    }
}
