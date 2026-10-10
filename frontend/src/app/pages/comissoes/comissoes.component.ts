import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComissoesService } from '../../core/services/comissoes.service';
import { ResumoComissoes, ComissaoVendedor } from '../../core/models/comissao.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-comissoes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="comissoes-page animate-fade-in">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <div class="header-badges">
            <span class="badge badge-indigo">Exercício 1</span>
            <span class="badge badge-neutral">Regras Comerciais</span>
          </div>
          <h1 class="page-title">Cálculo de Comissões da Equipe</h1>
          <p class="page-subtitle">
            Regra progressiva por venda: abaixo de R$ 100,00 (<strong>0%</strong>), de R$ 100,00 a R$ 499,99 (<strong>1%</strong>), a partir de R$ 500,00 (<strong>5%</strong>).
          </p>
        </div>

        <button class="btn btn-secondary" id="btn-recarregar-comissoes" (click)="carregar()" [disabled]="carregando()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Recarregar Vendas</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (carregando()) {
        <app-loader message="Lendo vendas e calculando comissões..."></app-loader>
      } @else if (erro()) {
        <div class="card error-card">
          <p>Erro ao obter dados de comissões. Verifique se o backend está em execução.</p>
          <button class="btn btn-primary btn-sm" (click)="carregar()">Tentar Novamente</button>
        </div>
      } @else if (resumo()) {
        <!-- Cards de Resumo Consolidado -->
        <div class="metrics-grid">
          <div class="card metric-card">
            <span class="metric-label">Total Vendido</span>
            <span class="metric-value">{{ resumo()!.totalVendido | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            <span class="metric-desc">Soma de todas as vendas</span>
          </div>

          <div class="card metric-card highlight-indigo">
            <span class="metric-label">Comissão Total a Pagar</span>
            <span class="metric-value text-indigo">{{ resumo()!.totalComissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            <span class="metric-desc">Remuneração variável gerada</span>
          </div>

          <div class="card metric-card">
            <span class="metric-label">Vendas Totais</span>
            <span class="metric-value">{{ totalVendasContador() }}</span>
            <span class="metric-desc">Registros processados</span>
          </div>

          <div class="card metric-card">
            <span class="metric-label">Vendedor Destaque</span>
            <span class="metric-value text-cyan">{{ vendedorLider()?.vendedor || '—' }}</span>
            <span class="metric-desc">{{ vendedorLider()?.totalComissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} em comissões</span>
          </div>
        </div>

        <!-- Gráfico de Barras em CSS Puro -->
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Distribuição de Comissões por Vendedor</h2>
              <p class="card-subtitle">Comparativo visual da participação de cada vendedor no total comissionado</p>
            </div>
            <span class="badge badge-cyan">Gráfico CSS Puro</span>
          </div>

          <div class="pure-css-chart">
            @for (vendedor of resumo()!.vendedores; track vendedor.vendedor) {
              <div class="chart-bar-group">
                <div class="chart-bar-labels">
                  <span class="chart-vendedor-name">{{ vendedor.vendedor }}</span>
                  <span class="chart-vendedor-val">{{ vendedor.totalComissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>
                <div class="chart-track">
                  <div class="chart-fill" [style.width.%]="calcularPercentualGrafico(vendedor.totalComissao)">
                    <span class="chart-tooltip">{{ calcularPercentualGrafico(vendedor.totalComissao) }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Barra de Busca -->
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              class="form-control search-input" 
              id="input-busca-vendedor"
              placeholder="Filtrar por nome do vendedor..." 
              [ngModel]="filtroTexto()"
              (ngModelChange)="filtroTexto.set($event)"
            />
          </div>
          <span class="filter-count">{{ vendedoresFiltrados().length }} de {{ resumo()!.vendedores.length }} vendedores</span>
        </div>

        <!-- Lista Detalhada e Expansível de Vendedores -->
        <div class="vendedores-container">
          @for (vendedor of vendedoresFiltrados(); track vendedor.vendedor; let idx = $index) {
            <div class="card vendedor-card" [class.expanded]="vendedorExpandido() === vendedor.vendedor">
              <!-- Cabeçalho do Card do Vendedor (Clicável para expandir) -->
              <div class="vendedor-summary" (click)="alternarExpansao(vendedor.vendedor)" [id]="'vendedor-card-' + idx">
                <div class="vendedor-ident">
                  <div class="vendedor-avatar" [ngClass]="'avatar-color-' + ((idx % 4) + 1)">
                    {{ obterIniciais(vendedor.vendedor) }}
                  </div>
                  <div class="vendedor-texts">
                    <h3 class="vendedor-nome">{{ vendedor.vendedor }}</h3>
                    <span class="vendedor-qtd-vendas">{{ vendedor.quantidadeVendas }} vendas realizadas</span>
                  </div>
                </div>

                <div class="vendedor-numbers">
                  <div class="vendedor-stat">
                    <span class="stat-label">Total em Vendas</span>
                    <span class="stat-value">{{ vendedor.totalVendido | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>

                  <div class="vendedor-stat">
                    <span class="stat-label">Comissão Gerada</span>
                    <span class="stat-value text-indigo highlight-stat">{{ vendedor.totalComissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>

                  <button class="expand-btn" [class.rotated]="vendedorExpandido() === vendedor.vendedor" aria-label="Expandir detalhes">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Tabela Expansível de Vendas Individuais -->
              @if (vendedorExpandido() === vendedor.vendedor) {
                <div class="vendedor-detalhes animate-fade-in">
                  <div class="detalhes-header">
                    <h4>Detalhamento das Vendas de {{ vendedor.vendedor }}</h4>
                    <span class="badge badge-neutral">{{ vendedor.vendas.length }} itens</span>
                  </div>

                  <div class="table-container">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Valor da Venda</th>
                          <th>Faixa Aplicada</th>
                          <th>% Comissão</th>
                          <th>Valor da Comissão</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (venda of vendedor.vendas; track $index; let vIdx = $index) {
                          <tr>
                            <td>#{{ vIdx + 1 }}</td>
                            <td class="font-bold">{{ venda.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td>
                            <td>
                              @if (venda.percentual === 0) {
                                <span class="badge badge-neutral">&lt; R$ 100,00</span>
                              } @else if (venda.percentual === 0.01) {
                                <span class="badge badge-cyan">R$ 100,00 – R$ 499,99</span>
                              } @else {
                                <span class="badge badge-indigo">&ge; R$ 500,00</span>
                              }
                            </td>
                            <td>
                              <span class="percent-tag">{{ (venda.percentual * 100) | number:'1.0-0' }}%</span>
                            </td>
                            <td class="text-indigo font-bold">
                              {{ venda.comissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .comissoes-page {
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

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      padding: 1.25rem 1.5rem;
    }

    .metric-card.highlight-indigo {
      border-color: rgba(99, 102, 241, 0.35);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(17, 24, 39, 0.75) 100%);
    }

    .metric-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      color: var(--text-muted);
    }

    .metric-value {
      font-size: 1.75rem;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0.25rem 0;
    }
    .text-indigo { color: #a5b4fc; }
    .text-cyan { color: #67e8f9; }

    .metric-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    /* Gráfico em CSS Puro */
    .chart-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .pure-css-chart {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      padding: 0.5rem 0;
    }

    .chart-bar-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .chart-bar-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .chart-vendedor-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .chart-vendedor-val {
      font-weight: 700;
      color: var(--accent-cyan);
      font-family: var(--font-heading);
    }

    .chart-track {
      height: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
      position: relative;
    }

    .chart-fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
      transition: width 800ms cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    .chart-tooltip {
      position: absolute;
      right: 6px;
      top: -1px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #0b1329;
    }

    /* Filtro */
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;
      max-width: 400px;
      display: flex;
      align-items: center;
    }

    .search-input-wrapper svg {
      position: absolute;
      left: 0.85rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      padding-left: 2.5rem;
    }

    .filter-count {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Cards de Vendedores */
    .vendedores-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .vendedor-card {
      padding: 0;
      transition: all var(--transition-base);
    }

    .vendedor-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      cursor: pointer;
      user-select: none;
      gap: 1.5rem;
    }

    .vendedor-summary:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .vendedor-ident {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .vendedor-avatar {
      width: 46px;
      height: 46px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.1rem;
    }
    .avatar-color-1 { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); }
    .avatar-color-2 { background: rgba(6, 182, 212, 0.2); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.4); }
    .avatar-color-3 { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); }
    .avatar-color-4 { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }

    .vendedor-texts {
      display: flex;
      flex-direction: column;
    }

    .vendedor-nome {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .vendedor-qtd-vendas {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .vendedor-numbers {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .vendedor-stat {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .highlight-stat {
      font-size: 1.25rem;
      font-family: var(--font-heading);
    }

    .expand-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: var(--radius-sm);
      transition: transform var(--transition-base), color var(--transition-fast);
    }

    .expand-btn.rotated {
      transform: rotate(180deg);
      color: var(--primary);
    }

    .vendedor-detalhes {
      padding: 1.25rem 1.5rem 1.5rem;
      border-top: 1px solid var(--border-subtle);
      background: rgba(11, 17, 30, 0.4);
    }

    .detalhes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .detalhes-header h4 {
      font-size: 1rem;
      color: var(--text-secondary);
    }

    .percent-tag {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-primary);
    }
    .font-bold { font-weight: 600; }

    .error-card {
      border-left: 4px solid var(--danger);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; }
      .vendedor-summary { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .vendedor-numbers { width: 100%; justify-content: space-between; }
      .filter-bar { flex-direction: column; align-items: flex-start; }
      .search-input-wrapper { max-width: 100%; width: 100%; }
    }
  `]
})
export class ComissoesComponent implements OnInit {
  private readonly comissoesService = inject(ComissoesService);

  readonly carregando = signal(true);
  readonly erro = signal(false);
  readonly resumo = signal<ResumoComissoes | null>(null);
  readonly filtroTexto = signal('');
  readonly vendedorExpandido = signal<string | null>(null);

  readonly vendedoresFiltrados = computed(() => {
    const r = this.resumo();
    if (!r) return [];
    const busca = this.filtroTexto().trim().toLowerCase();
    if (!busca) return r.vendedores;
    return r.vendedores.filter(v => v.vendedor.toLowerCase().includes(busca));
  });

  readonly vendedorLider = computed(() => {
    const r = this.resumo();
    return r?.vendedores?.[0] || null;
  });

  readonly totalVendasContador = computed(() => {
    const r = this.resumo();
    if (!r) return 0;
    return r.vendedores.reduce((acc, v) => acc + v.quantidadeVendas, 0);
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(false);
    this.comissoesService.obterResumo().subscribe({
      next: (dados) => {
        this.resumo.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      }
    });
  }

  alternarExpansao(vendedor: string): void {
    if (this.vendedorExpandido() === vendedor) {
      this.vendedorExpandido.set(null);
    } else {
      this.vendedorExpandido.set(vendedor);
    }
  }

  calcularPercentualGrafico(comissao: number): number {
    const total = this.resumo()?.totalComissao || 1;
    return Math.max(5, Math.round((comissao / total) * 100));
  }

  obterIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
