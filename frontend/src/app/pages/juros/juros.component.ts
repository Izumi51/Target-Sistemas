import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JurosService } from '../../core/services/juros.service';
import { ResultadoJuros } from '../../core/models/juros.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-juros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="juros-page animate-fade-in">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <div class="header-badges">
            <span class="badge badge-purple">Exercício 3</span>
            <span class="badge badge-neutral">Cálculo Financeiro</span>
          </div>
          <h1 class="page-title">Calculadora de Juros por Atraso</h1>
          <p class="page-subtitle">
            Multa simples de <strong>2,5% ao dia</strong> incidente sobre o valor original a partir do vencimento até a data de hoje.
          </p>
        </div>
      </div>

      <div class="juros-layout">
        <!-- Coluna da Esquerda: Formulário de Entrada -->
        <div class="card form-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Parâmetros do Boleto / Título</h2>
              <p class="card-subtitle">Informe o valor e a data de vencimento original</p>
            </div>
            <span class="badge badge-purple">2,5% ao dia</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="calcular()" class="juros-form">
            <!-- Campo: Valor Original -->
            <div class="form-group">
              <label class="form-label" for="input-valor">Valor Original (R$) *</label>
              <div class="currency-input-wrapper">
                <span class="currency-prefix">R$</span>
                <input 
                  type="number" 
                  id="input-valor" 
                  class="form-control currency-input" 
                  formControlName="valor" 
                  placeholder="0,00"
                  step="0.01"
                  min="0.01"
                />
              </div>
              @if (form.get('valor')?.touched && form.get('valor')?.hasError('required')) {
                <span class="form-error">O valor é obrigatório.</span>
              }
              @if (form.get('valor')?.touched && form.get('valor')?.hasError('min')) {
                <span class="form-error">O valor deve ser maior que zero.</span>
              }
            </div>

            <!-- Campo: Data de Vencimento -->
            <div class="form-group">
              <label class="form-label" for="input-vencimento">Data de Vencimento *</label>
              <input 
                type="date" 
                id="input-vencimento" 
                class="form-control" 
                formControlName="vencimento" 
              />
              @if (form.get('vencimento')?.touched && form.get('vencimento')?.hasError('required')) {
                <span class="form-error">A data de vencimento é obrigatória.</span>
              }
            </div>

            <!-- Botões de Atalho para Simulação Rápida -->
            <div class="shortcuts-container">
              <span class="shortcuts-title">Atalhos rápidos para teste:</span>
              <div class="shortcuts-buttons">
                <button type="button" class="btn btn-outline btn-xs" id="btn-shortcut-ontem" (click)="aplicarAtalho(-1)">
                  1 dia de atraso
                </button>
                <button type="button" class="btn btn-outline btn-xs" id="btn-shortcut-10dias" (click)="aplicarAtalho(-10)">
                  10 dias de atraso
                </button>
                <button type="button" class="btn btn-outline btn-xs" id="btn-shortcut-hoje" (click)="aplicarAtalho(0)">
                  Vence hoje
                </button>
                <button type="button" class="btn btn-outline btn-xs" id="btn-shortcut-futuro" (click)="aplicarAtalho(5)">
                  Vence em 5 dias
                </button>
              </div>
            </div>

            <!-- Botão Submit -->
            <div class="form-action-row">
              <button 
                type="submit" 
                class="btn btn-cyan btn-calculate" 
                id="btn-calcular-juros"
                [disabled]="form.invalid || calculando()">
                @if (calculando()) {
                  <span>Calculando...</span>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Calcular Juros na Data de Hoje</span>
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Coluna da Direita: Resultado Detalhado -->
        <div class="result-column">
          @if (calculando()) {
            <div class="card result-placeholder">
              <app-loader message="Processando cálculo financeiro..."></app-loader>
            </div>
          } @else if (resultado(); as res) {
            <div class="card result-card animate-fade-in" [class.vencido]="res.vencido" [class.em-dia]="!res.vencido">
              <!-- Banner de Status -->
              <div class="status-banner">
                @if (res.vencido) {
                  <div class="status-icon icon-danger">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div class="status-text">
                    <h3>Título em Atraso ({{ res.diasAtraso }} {{ res.diasAtraso === 1 ? 'dia corrido' : 'dias corridos' }})</h3>
                    <p>Incidência de multa/juros simples diários de 2,5% sobre o valor principal.</p>
                  </div>
                } @else {
                  <div class="status-icon icon-success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div class="status-text">
                    <h3>Título Não Vencido (Em Dia)</h3>
                    <p>Vencimento na data de hoje ou futura. Nenhuma cobrança de juros aplicada.</p>
                  </div>
                }
              </div>

              <!-- Destaque do Total -->
              <div class="total-highlight-card">
                <span class="total-label">Total a Pagar com Juros</span>
                <span class="total-amount">{{ res.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                <span class="total-breakdown">
                  Principal: {{ res.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} + Juros: {{ res.juros | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
              </div>

              <!-- Grade com Detalhamento -->
              <div class="details-grid">
                <div class="detail-box">
                  <span class="box-label">Valor Original</span>
                  <span class="box-val">{{ res.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                </div>

                <div class="detail-box">
                  <span class="box-label">Vencimento</span>
                  <span class="box-val">{{ res.vencimento }}</span>
                </div>

                <div class="detail-box">
                  <span class="box-label">Data do Cálculo</span>
                  <span class="box-val">{{ res.dataCalculo }}</span>
                </div>

                <div class="detail-box">
                  <span class="box-label">Dias de Atraso</span>
                  <span class="box-val" [ngClass]="res.diasAtraso > 0 ? 'text-danger' : 'text-success'">
                    {{ res.diasAtraso }} dias
                  </span>
                </div>

                <div class="detail-box">
                  <span class="box-label">Taxa Diária</span>
                  <span class="box-val">2,5% ao dia</span>
                </div>

                <div class="detail-box">
                  <span class="box-label">Valor dos Juros</span>
                  <span class="box-val font-bold" [ngClass]="res.juros > 0 ? 'text-indigo' : 'text-success'">
                    {{ res.juros | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
              </div>

              <!-- Memória de Cálculo Transparente -->
              <div class="formula-box">
                <div class="formula-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>Memória de Cálculo (Fórmula do Desafio)</span>
                </div>
                <code class="formula-code">
                  juros = {{ res.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} × 2,5% × {{ res.diasAtraso }} dias = {{ res.juros | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </code>
              </div>
            </div>
          } @else {
            <div class="card empty-result-card">
              <div class="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3>Nenhum cálculo efetuado</h3>
              <p>Preencha os valores ao lado ou clique em um dos atalhos para simular a multa de atraso.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .juros-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
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

    .juros-layout {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 1.5rem;
      align-items: start;
    }

    .form-card {
      border-color: rgba(139, 92, 246, 0.25);
    }

    .juros-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .currency-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-prefix {
      position: absolute;
      left: 0.95rem;
      color: var(--text-muted);
      font-weight: 600;
      font-family: var(--font-mono);
      pointer-events: none;
    }

    .currency-input {
      padding-left: 2.6rem;
      font-family: var(--font-mono);
      font-size: 1.05rem;
      font-weight: 600;
    }

    .shortcuts-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.85rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .shortcuts-title {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .shortcuts-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .btn-xs {
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
    }

    .form-action-row {
      padding-top: 0.5rem;
    }

    .btn-calculate {
      width: 100%;
      padding: 0.8rem;
      font-size: 0.95rem;
    }

    /* Coluna de Resultados */
    .result-column {
      display: flex;
      flex-direction: column;
    }

    .result-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      transition: all var(--transition-base);
    }

    .result-card.vencido {
      border-color: rgba(239, 68, 68, 0.35);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, var(--bg-card) 100%);
    }

    .result-card.em-dia {
      border-color: rgba(16, 185, 129, 0.35);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%);
    }

    .status-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-subtle);
    }

    .status-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-danger { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
    .icon-success { background: rgba(16, 185, 129, 0.15); color: var(--success); }

    .status-text h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .status-text p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }

    /* Destaque do Total */
    .total-highlight-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .total-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
      color: var(--text-muted);
    }

    .total-amount {
      font-size: 2.5rem;
      font-family: var(--font-heading);
      font-weight: 800;
      color: var(--text-primary);
      margin: 0.25rem 0;
      background: linear-gradient(135deg, #ffffff 0%, #67e8f9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .total-breakdown {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    /* Grade de Detalhes */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
    }

    .detail-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0.85rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .box-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .box-val {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .text-danger { color: #f87171; }
    .text-success { color: #34d399; }
    .text-indigo { color: #a5b4fc; }
    .font-bold { font-weight: 700; }

    /* Fórmula */
    .formula-box {
      padding: 0.85rem 1rem;
      background: rgba(15, 23, 42, 0.8);
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-medium);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .formula-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }

    .formula-code {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    /* Empty State */
    .empty-result-card, .result-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      min-height: 420px;
    }

    .empty-icon {
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .empty-result-card h3 {
      font-size: 1.15rem;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
    }

    .empty-result-card p {
      font-size: 0.85rem;
      color: var(--text-muted);
      max-width: 340px;
    }

    @media (max-width: 900px) {
      .juros-layout { grid-template-columns: 1fr; }
      .details-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class JurosComponent {
  private readonly jurosService = inject(JurosService);
  private readonly fb = inject(FormBuilder);

  readonly calculando = signal(false);
  readonly resultado = signal<ResultadoJuros | null>(null);

  readonly form = this.fb.group({
    valor: [1000.00, [Validators.required, Validators.min(0.01)]],
    vencimento: [this.obterDataPadrao(), [Validators.required]]
  });

  private obterDataPadrao(): string {
    const d = new Date();
    d.setDate(d.getDate() - 10); // Padrão: 10 dias atrás para já ver o cálculo funcionando
    return d.toISOString().split('T')[0];
  }

  aplicarAtalho(dias: number): void {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const dataStr = d.toISOString().split('T')[0];
    this.form.patchValue({ vencimento: dataStr });
    this.calcular();
  }

  calcular(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { valor, vencimento } = this.form.getRawValue();

    this.calculando.set(true);
    this.jurosService.calcular(Number(valor), vencimento!).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.calculando.set(false);
      },
      error: () => {
        this.calculando.set(false);
      }
    });
  }
}
