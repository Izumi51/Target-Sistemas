import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ComissoesService } from '../../core/services/comissoes.service';
import { EstoqueService } from '../../core/services/estoque.service';
import { ApiStatusService } from '../../core/services/api-status.service';
import { ResumoComissoes } from '../../core/models/comissao.model';
import { Produto, Movimentacao } from '../../core/models/estoque.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Cabeçalho de Boas-Vindas -->
      <div class="dashboard-hero">
        <div class="hero-content">
          <div class="hero-badges">
            <span class="badge badge-indigo">Target Sistemas</span>
            <span class="badge badge-cyan">Full Stack .NET + Angular</span>
            <span class="badge" [ngClass]="apiStatusService.status() === 'online' ? 'badge-success' : 'badge-danger'">
              API: {{ apiStatusService.status() | uppercase }}
            </span>
          </div>
          <h1 class="hero-title">Painel Geral de Operações</h1>
          <p class="hero-subtitle">
            Visão consolidada dos três desafios operacionais: comissões comerciais por faixas progressivas, controle de inventário do depósito e calculadora de juros diários.
          </p>
        </div>

        <div class="hero-actions">
          <button class="btn btn-secondary" id="btn-refresh-dashboard" (click)="carregarDados()" [disabled]="carregando()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span>Atualizar Painel</span>
          </button>
        </div>
      </div>

      <!-- Estado de Carregamento -->
      @if (carregando()) {
        <app-loader message="Consultando métricas do backend..."></app-loader>
      } @else if (erroConexao()) {
        <!-- Estado de Erro / Backend Offline -->
        <div class="card offline-card">
          <div class="offline-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="offline-text">
            <h3>Conexão com a API indisponível</h3>
            <p>O backend (.NET 8) não respondeu em <code>http://localhost:5000/api</code>. Certifique-se de que a API está rodando.</p>
          </div>
          <button class="btn btn-primary" id="btn-retry-connection" (click)="carregarDados()">
            <span>Tentar Novamente</span>
          </button>
        </div>
      } @else {
        <!-- Métricas KPI Principais -->
        <div class="kpi-grid">
          <!-- KPI 1: Total Vendido -->
          <div class="card kpi-card">
            <div class="kpi-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Volume Total de Vendas</span>
              <span class="kpi-value">{{ resumoComissoes()?.totalVendido | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="kpi-meta">Equipe Comercial ({{ resumoComissoes()?.vendedores?.length || 0 }} vendedores)</span>
            </div>
          </div>

          <!-- KPI 2: Total Comissões -->
          <div class="card kpi-card">
            <div class="kpi-icon icon-indigo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Comissões Calculadas</span>
              <span class="kpi-value text-indigo">{{ resumoComissoes()?.totalComissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="kpi-meta">Calculadas por faixas (0%, 1% e 5%)</span>
            </div>
          </div>

          <!-- KPI 3: Itens no Estoque -->
          <div class="card kpi-card">
            <div class="kpi-icon icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Itens Físicos em Saldo</span>
              <span class="kpi-value text-cyan">{{ totalItensEstoque() | number:'1.0-0':'pt-BR' }}</span>
              <span class="kpi-meta">{{ produtos().length }} produtos cadastrados</span>
            </div>
          </div>

          <!-- KPI 4: Movimentações -->
          <div class="card kpi-card">
            <div class="kpi-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Movimentações Realizadas</span>
              <span class="kpi-value text-purple">{{ movimentacoes().length }}</span>
              <span class="kpi-meta">
                @if (movimentacoes().length > 0) {
                  Última: #{{ movimentacoes()[0].id }} ({{ movimentacoes()[0].tipo }})
                } @else {
                  Nenhum movimento lançado
                }
              </span>
            </div>
          </div>
        </div>

        <!-- Seção Central: Visão Rápida dos 3 Módulos -->
        <div class="dashboard-columns">
          <!-- Coluna 1: Destaque de Vendas -->
          <div class="card summary-panel">
            <div class="card-header">
              <div>
                <h2 class="card-title">Ranking Comercial (Comissões)</h2>
                <p class="card-subtitle">Top vendedores ordenados pelo total de comissão recebida</p>
              </div>
              <a routerLink="/comissoes" class="btn btn-outline btn-sm" id="btn-view-all-comissoes">Ver Todos</a>
            </div>

            <div class="ranking-list">
              @for (vendedor of resumoComissoes()?.vendedores?.slice(0, 4); track vendedor.vendedor; let idx = $index) {
                <div class="ranking-row">
                  <div class="ranking-position" [ngClass]="'pos-' + (idx + 1)">#{{ idx + 1 }}</div>
                  <div class="ranking-details">
                    <div class="ranking-name-row">
                      <span class="ranking-name">{{ vendedor.vendedor }}</span>
                      <span class="ranking-comissao">{{ vendedor.totalComissao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                    </div>
                    <div class="ranking-bar-track">
                      <div class="ranking-bar-fill" [style.width.%]="calcularPorcentagemComissao(vendedor.totalComissao)"></div>
                    </div>
                    <div class="ranking-meta-row">
                      <span>{{ vendedor.quantidadeVendas }} vendas realizadas</span>
                      <span>Total vendido: {{ vendedor.totalVendido | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Coluna 2: Saldo de Estoque e Atalhos -->
          <div class="card summary-panel">
            <div class="card-header">
              <div>
                <h2 class="card-title">Situação do Estoque</h2>
                <p class="card-subtitle">Produtos e disponibilidade no depósito</p>
              </div>
              <a routerLink="/estoque" class="btn btn-outline btn-sm" id="btn-view-all-estoque">Gerenciar</a>
            </div>

            <div class="stock-list">
              @for (produto of produtos(); track produto.codigoProduto) {
                <div class="stock-row">
                  <div class="stock-code">#{{ produto.codigoProduto }}</div>
                  <div class="stock-info">
                    <span class="stock-desc">{{ produto.descricaoProduto }}</span>
                  </div>
                  <div class="stock-badge-container">
                    <span class="badge" [ngClass]="produto.estoque < 100 ? 'badge-warning' : 'badge-cyan'">
                      {{ produto.estoque }} unid.
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Banner para Cálculo de Juros -->
            <div class="juros-banner">
              <div class="juros-banner-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="juros-banner-text">
                <strong>Precisa calcular juros de um boleto?</strong>
                <p>Taxa de 2,5% ao dia com contagem automática de dias de atraso.</p>
              </div>
              <a routerLink="/juros" class="btn btn-cyan btn-sm" id="btn-open-juros-banner">Calcular</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .dashboard-hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      padding-bottom: 0.5rem;
    }

    .hero-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.85rem;
      flex-wrap: wrap;
    }

    .hero-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.4rem;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-secondary);
      max-width: 850px;
      line-height: 1.5;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
    }

    .kpi-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .icon-indigo { background: var(--primary-light); color: var(--primary); }
    .icon-cyan { background: var(--accent-cyan-light); color: var(--accent-cyan); }
    .icon-purple { background: var(--accent-purple-light); color: var(--accent-purple); }

    .kpi-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .kpi-label {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .kpi-value {
      font-size: 1.6rem;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0.15rem 0;
    }
    .text-indigo { color: #a5b4fc; }
    .text-cyan { color: #67e8f9; }
    .text-purple { color: #c4b5fd; }

    .kpi-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dashboard-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 1.5rem;
    }

    .summary-panel {
      display: flex;
      flex-direction: column;
    }

    .btn-sm {
      padding: 0.35rem 0.85rem;
      font-size: 0.8rem;
    }

    /* Ranking Comercial */
    .ranking-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .ranking-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .ranking-position {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.85rem;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    .pos-1 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .pos-2 { background: rgba(148, 163, 184, 0.2); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.4); }
    .pos-3 { background: rgba(180, 83, 9, 0.2); color: #d97706; border: 1px solid rgba(180, 83, 9, 0.4); }

    .ranking-details {
      flex: 1;
      min-width: 0;
    }

    .ranking-name-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .ranking-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .ranking-comissao {
      font-weight: 700;
      font-family: var(--font-heading);
      color: var(--accent-cyan);
    }

    .ranking-bar-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 0.35rem;
    }

    .ranking-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%);
      transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ranking-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Lista de Estoque */
    .stock-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .stock-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.85rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .stock-code {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-weight: 600;
      min-width: 48px;
    }

    .stock-info {
      flex: 1;
    }

    .stock-desc {
      font-size: 0.9rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Banner Juros */
    .juros-banner {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-md);
    }

    .juros-banner-icon {
      color: var(--accent-cyan);
      flex-shrink: 0;
    }

    .juros-banner-text {
      flex: 1;
    }
    .juros-banner-text strong {
      font-size: 0.9rem;
      color: var(--text-primary);
      display: block;
    }
    .juros-banner-text p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }

    /* Offline Card */
    .offline-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-left: 4px solid var(--danger);
      background: rgba(239, 68, 68, 0.08);
    }
    .offline-icon { color: var(--danger); flex-shrink: 0; }
    .offline-text { flex: 1; }
    .offline-text h3 { font-size: 1.1rem; color: #fca5a5; margin-bottom: 0.25rem; }
    .offline-text p { font-size: 0.85rem; color: var(--text-secondary); }
    .offline-text code { background: rgba(0,0,0,0.4); padding: 0.15rem 0.4rem; border-radius: 4px; color: #f87171; }

    @media (max-width: 768px) {
      .dashboard-hero {
        flex-direction: column;
      }
      .dashboard-columns {
        grid-template-columns: 1fr;
      }
      .juros-banner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly comissoesService = inject(ComissoesService);
  private readonly estoqueService = inject(EstoqueService);
  readonly apiStatusService = inject(ApiStatusService);

  readonly carregando = signal(true);
  readonly erroConexao = signal(false);

  readonly resumoComissoes = signal<ResumoComissoes | null>(null);
  readonly produtos = signal<Produto[]>([]);
  readonly movimentacoes = signal<Movimentacao[]>([]);

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.erroConexao.set(false);

    forkJoin({
      comissoes: this.comissoesService.obterResumo(),
      produtos: this.estoqueService.listarProdutos(),
      movimentacoes: this.estoqueService.listarMovimentacoes()
    }).subscribe({
      next: (dados) => {
        this.resumoComissoes.set(dados.comissoes);
        this.produtos.set(dados.produtos);
        this.movimentacoes.set(dados.movimentacoes);
        this.carregando.set(false);
      },
      error: () => {
        this.erroConexao.set(true);
        this.carregando.set(false);
      }
    });
  }

  totalItensEstoque(): number {
    return this.produtos().reduce((total, p) => total + p.estoque, 0);
  }

  calcularPorcentagemComissao(comissao: number): number {
    const total = this.resumoComissoes()?.totalComissao || 1;
    return Math.min(100, Math.round((comissao / total) * 100));
  }
}
