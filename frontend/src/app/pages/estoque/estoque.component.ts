import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EstoqueService } from '../../core/services/estoque.service';
import { ToastService } from '../../core/services/toast.service';
import { Produto, Movimentacao, TipoMovimentacao } from '../../core/models/estoque.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="estoque-page animate-fade-in">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <div class="header-badges">
            <span class="badge badge-cyan">Exercício 2</span>
            <span class="badge badge-neutral">Controle de Depósito</span>
          </div>
          <h1 class="page-title">Gestão e Movimentação de Estoque</h1>
          <p class="page-subtitle">
            Lançamento com ID sequencial único, validação estrita de saldo disponível e persistência íntegra em JSON.
          </p>
        </div>

        <button class="btn btn-secondary" id="btn-recarregar-estoque" (click)="carregarDados()" [disabled]="carregando()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Atualizar Estoque</span>
        </button>
      </div>

      @if (carregando() && produtos().length === 0) {
        <app-loader message="Consultando saldo do depósito..."></app-loader>
      } @else {
        <!-- Seção 1: Grade de Produtos em Estoque -->
        <div class="section-container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Produtos no Depósito</h2>
              <p class="section-subtitle">Clique em "Lançar Movimento" para pré-selecionar o produto no formulário</p>
            </div>
            <span class="badge badge-indigo">{{ produtos().length }} Produtos Ativos</span>
          </div>

          <div class="products-grid">
            @for (produto of produtos(); track produto.codigoProduto) {
              <div class="card product-card" [class.low-stock]="produto.estoque < 100">
                <div class="product-top">
                  <div class="product-code-tag">COD #{{ produto.codigoProduto }}</div>
                  @if (produto.estoque < 100) {
                    <span class="badge badge-warning">Estoque Baixo</span>
                  } @else {
                    <span class="badge badge-success">Disponível</span>
                  }
                </div>

                <h3 class="product-name">{{ produto.descricaoProduto }}</h3>

                <div class="product-stock-display">
                  <span class="stock-label">Saldo Atual</span>
                  <div class="stock-number-wrapper">
                    <span class="stock-number">{{ produto.estoque }}</span>
                    <span class="stock-unit">unidades</span>
                  </div>
                </div>

                <div class="product-actions">
                  <button 
                    class="btn btn-outline btn-sm w-full" 
                    [id]="'btn-select-prod-' + produto.codigoProduto"
                    (click)="preSelecionarProduto(produto)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Lançar Movimento</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Seção 2: Formulário de Lançamento de Movimentação -->
        <div class="card form-card" id="form-movimentacao-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Nova Movimentação de Estoque</h2>
              <p class="card-subtitle">Entrada (abastecimento) ou Saída (baixa/venda) com atualização em tempo real</p>
            </div>
            <span class="badge badge-cyan">Transação Atômica</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="enviarMovimentacao()" class="movement-form">
            <div class="form-grid">
              <!-- Campo: Produto -->
              <div class="form-group">
                <label class="form-label" for="select-produto">Produto *</label>
                <select id="select-produto" class="form-select" formControlName="codigoProduto">
                  <option [ngValue]="null" disabled>Selecione um produto...</option>
                  @for (prod of produtos(); track prod.codigoProduto) {
                    <option [ngValue]="prod.codigoProduto">
                      #{{ prod.codigoProduto }} – {{ prod.descricaoProduto }} (Saldo: {{ prod.estoque }})
                    </option>
                  }
                </select>
                @if (form.get('codigoProduto')?.touched && form.get('codigoProduto')?.hasError('required')) {
                  <span class="form-error">O produto é obrigatório.</span>
                }
              </div>

              <!-- Campo: Tipo (Segmented Toggle Entrada / Saída) -->
              <div class="form-group">
                <label class="form-label">Tipo de Movimentação *</label>
                <div class="type-toggle-group">
                  <button 
                    type="button" 
                    class="toggle-btn toggle-entrada" 
                    [class.active]="form.get('tipo')?.value === 'Entrada'"
                    id="btn-tipo-entrada"
                    (click)="form.get('tipo')?.setValue('Entrada')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Entrada (Adicionar)</span>
                  </button>

                  <button 
                    type="button" 
                    class="toggle-btn toggle-saida" 
                    [class.active]="form.get('tipo')?.value === 'Saida'"
                    id="btn-tipo-saida"
                    (click)="form.get('tipo')?.setValue('Saida')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="17 14 12 9 7 14"></polyline>
                      <line x1="12" y1="9" x2="12" y2="21"></line>
                    </svg>
                    <span>Saída (Dar Baixa)</span>
                  </button>
                </div>
              </div>

              <!-- Campo: Quantidade -->
              <div class="form-group">
                <label class="form-label" for="input-quantidade">Quantidade *</label>
                <input 
                  type="number" 
                  id="input-quantidade" 
                  class="form-control" 
                  formControlName="quantidade" 
                  placeholder="Ex.: 15"
                  min="1"
                />
                @if (form.get('quantidade')?.touched && form.get('quantidade')?.hasError('required')) {
                  <span class="form-error">A quantidade é obrigatória.</span>
                }
                @if (form.get('quantidade')?.touched && form.get('quantidade')?.hasError('min')) {
                  <span class="form-error">A quantidade deve ser maior que zero.</span>
                }
              </div>

              <!-- Campo: Descrição -->
              <div class="form-group span-2">
                <div class="label-with-counter">
                  <label class="form-label" for="input-descricao">Descrição da Movimentação *</label>
                  <span class="char-counter">{{ form.get('descricao')?.value?.length || 0 }}/200</span>
                </div>
                <input 
                  type="text" 
                  id="input-descricao" 
                  class="form-control" 
                  formControlName="descricao" 
                  placeholder="Ex.: Recebimento de novo lote do fornecedor ou Baixa para pedido #492"
                  maxlength="200"
                />
                @if (form.get('descricao')?.touched && form.get('descricao')?.hasError('required')) {
                  <span class="form-error">A descrição para identificar o tipo da movimentação é obrigatória.</span>
                }
              </div>
            </div>

            <!-- Preview do Efeito e Botão Submit -->
            <div class="form-submit-row">
              <div class="movement-preview">
                @if (produtoSelecionado(); as p) {
                  @if (saldoPrevisto(p.estoque); as novoSaldo) {
                    <span>
                      Saldo previsto: 
                      <strong>{{ p.estoque }}</strong>
                      {{ form.get('tipo')?.value === 'Entrada' ? '+' : '-' }}
                      {{ form.get('quantidade')?.value }} =
                      <strong class="text-cyan">{{ novoSaldo }} unid.</strong>
                    </span>
                  }
                }
              </div>

              <button 
                type="submit" 
                class="btn btn-primary btn-submit" 
                id="btn-submit-movimentacao"
                [disabled]="form.invalid || enviando()">
                @if (enviando()) {
                  <span>Gravando...</span>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>Confirmar e Atualizar Estoque</span>
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Seção 3: Histórico de Movimentações -->
        <div class="card history-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Histórico de Movimentações</h2>
              <p class="card-subtitle">Registros auditáveis com número identificador único e estoque final apurado</p>
            </div>

            <!-- Filtro de Produto no Histórico -->
            <div class="history-filter">
              <select 
                class="form-select form-select-sm" 
                id="select-filtro-historico"
                [value]="filtroCodigoProduto() ?? ''" 
                (change)="alterarFiltroHistorico($event)">
                <option value="">Todos os Produtos</option>
                @for (prod of produtos(); track prod.codigoProduto) {
                  <option [value]="prod.codigoProduto">#{{ prod.codigoProduto }} – {{ prod.descricaoProduto }}</option>
                }
              </select>
            </div>
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data / Hora</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Qtd.</th>
                  <th>Saldo Anterior</th>
                  <th>Estoque Final</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                @for (mov of movimentacoesFiltradas(); track mov.id) {
                  <tr>
                    <td class="font-mono text-cyan">#{{ mov.id }}</td>
                    <td class="text-secondary">{{ mov.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                    <td>
                      <span class="prod-badge">#{{ mov.codigoProduto }}</span>
                      {{ obterNomeProduto(mov.codigoProduto) }}
                    </td>
                    <td>
                      @if (mov.tipo === 'Entrada') {
                        <span class="badge badge-success">Entrada</span>
                      } @else {
                        <span class="badge badge-danger">Saída</span>
                      }
                    </td>
                    <td class="font-bold">{{ mov.quantidade }}</td>
                    <td>{{ mov.estoqueAnterior }}</td>
                    <td class="font-bold text-cyan">{{ mov.estoqueFinal }}</td>
                    <td class="text-secondary">{{ mov.descricao }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state-cell">
                      Nenhuma movimentação encontrada para o filtro selecionado.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .estoque-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .header-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      max-width: 800px;
      margin-top: 0.35rem;
      line-height: 1.5;
    }

    /* Grade de Produtos */
    .section-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 700;
    }

    .section-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .product-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      border: 1px solid var(--border-subtle);
    }

    .product-card.low-stock {
      border-color: rgba(245, 158, 11, 0.4);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, var(--bg-card) 100%);
    }

    .product-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .product-code-tag {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .product-name {
      font-size: 1.05rem;
      font-weight: 600;
      line-height: 1.3;
      color: var(--text-primary);
    }

    .product-stock-display {
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .stock-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .stock-number-wrapper {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .stock-number {
      font-size: 1.75rem;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--text-primary);
    }

    .stock-unit {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .w-full { width: 100%; }

    /* Formulário de Movimentação */
    .form-card {
      border-color: rgba(99, 102, 241, 0.25);
    }

    .movement-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .span-2 {
      grid-column: span 2;
    }

    .type-toggle-group {
      display: flex;
      gap: 0.5rem;
    }

    .toggle-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.7rem;
      background: var(--bg-input);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .toggle-btn:hover {
      border-color: rgba(255, 255, 255, 0.25);
    }

    .toggle-entrada.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: var(--success);
      color: #6ee7b7;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
    }

    .toggle-saida.active {
      background: rgba(239, 68, 68, 0.2);
      border-color: var(--danger);
      color: #fca5a5;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
    }

    .label-with-counter {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .char-counter {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .form-submit-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
      gap: 1rem;
    }

    .movement-preview {
      font-size: 0.95rem;
      color: var(--text-secondary);
    }

    .btn-submit {
      padding: 0.75rem 1.75rem;
      font-size: 0.95rem;
    }

    /* Histórico */
    .history-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-select-sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.85rem;
      min-width: 220px;
    }

    .prod-badge {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent-cyan);
      margin-right: 0.35rem;
    }

    .empty-state-cell {
      text-align: center;
      padding: 2.5rem !important;
      color: var(--text-muted);
    }

    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 600; }
    .text-cyan { color: #67e8f9; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; }
      .span-2 { grid-column: span 1; }
      .form-submit-row { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class EstoqueComponent implements OnInit {
  private readonly estoqueService = inject(EstoqueService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly produtos = signal<Produto[]>([]);
  readonly movimentacoes = signal<Movimentacao[]>([]);
  readonly filtroCodigoProduto = signal<number | null>(null);

  readonly form = this.fb.group({
    codigoProduto: [null as number | null, [Validators.required]],
    tipo: ['Entrada' as TipoMovimentacao, [Validators.required]],
    quantidade: [null as number | null, [Validators.required, Validators.min(1)]],
    descricao: ['', [Validators.required, Validators.maxLength(200)]]
  });

  readonly produtoSelecionado = computed(() => {
    const cod = this.form.get('codigoProduto')?.value;
    if (cod == null) return null;
    return this.produtos().find(p => p.codigoProduto === cod) || null;
  });

  readonly movimentacoesFiltradas = computed(() => {
    const filtro = this.filtroCodigoProduto();
    if (filtro == null) return this.movimentacoes();
    return this.movimentacoes().filter(m => m.codigoProduto === filtro);
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.estoqueService.listarProdutos().subscribe({
      next: (prods) => {
        this.produtos.set(prods);
        this.carregarHistorico();
      },
      error: () => this.carregando.set(false)
    });
  }

  carregarHistorico(): void {
    this.estoqueService.listarMovimentacoes().subscribe({
      next: (movs) => {
        this.movimentacoes.set(movs);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false)
    });
  }

  preSelecionarProduto(produto: Produto): void {
    this.form.patchValue({ codigoProduto: produto.codigoProduto });
    const elemento = document.getElementById('form-movimentacao-card');
    elemento?.scrollIntoView({ behavior: 'smooth' });
  }

  enviarMovimentacao(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { codigoProduto, tipo, quantidade, descricao } = this.form.getRawValue();

    this.enviando.set(true);
    this.estoqueService.lancarMovimentacao({
      codigoProduto: codigoProduto!,
      tipo: tipo!,
      quantidade: quantidade!,
      descricao: descricao!.trim()
    }).subscribe({
      next: (resultado) => {
        this.enviando.set(false);

        // Feedback de Sucesso com o Estoque Final apurado
        this.toastService.success(
          'Movimentação Realizada com Sucesso!',
          `Produto "${resultado.produto.descricaoProduto}": novo estoque final é de ${resultado.estoqueFinal} unidades.`
        );

        // Atualiza a lista em memória reativamente
        this.produtos.update(lista =>
          lista.map(p => p.codigoProduto === resultado.produto.codigoProduto ? resultado.produto : p)
        );
        this.movimentacoes.update(lista => [resultado.movimentacao, ...lista]);

        // Reseta o formulário mantendo o produto selecionado
        this.form.reset({
          codigoProduto: codigoProduto,
          tipo: tipo,
          quantidade: null,
          descricao: ''
        });
      },
      error: () => {
        this.enviando.set(false);
      }
    });
  }

  alterarFiltroHistorico(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.filtroCodigoProduto.set(valor ? Number(valor) : null);
  }

  saldoPrevisto(estoqueAtual: number): number | null {
    const qtd = this.form.get('quantidade')?.value;
    if (qtd == null || qtd <= 0) return null;
    const tipo = this.form.get('tipo')?.value;
    return tipo === 'Entrada' ? estoqueAtual + qtd : estoqueAtual - qtd;
  }

  obterNomeProduto(codigo: number): string {
    const prod = this.produtos().find(p => p.codigoProduto === codigo);
    return prod ? prod.descricaoProduto : `Produto #${codigo}`;
  }
}
