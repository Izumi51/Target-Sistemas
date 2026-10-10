import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComissoesService } from '../../core/services/comissoes.service';
import { EstoqueService } from '../../core/services/estoque.service';
import { ApiStatusService } from '../../core/services/api-status.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page animate-fade-in">
      <div class="page-intro">
        <div class="intro-badge">
          <span class="badge badge-indigo">Target Sistemas</span>
          <span class="badge badge-cyan">Full Stack</span>
        </div>
        <h1 class="page-title">Painel de Controle Operacional</h1>
        <p class="page-description">
          Acesso unificado aos módulos do desafio: cálculo de comissões por faixa, controle e movimentação de estoque e cálculo de juros diários por atraso.
        </p>
      </div>

      <!-- Grid de Módulos / Acesso Rápido -->
      <div class="modules-grid">
        <!-- Card Comissões -->
        <div class="card card-interactive module-card">
          <div class="card-glow glow-indigo"></div>
          <div class="module-header">
            <div class="module-icon icon-indigo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <span class="badge badge-indigo">Exercício 1</span>
          </div>
          <h2 class="module-title">Comissões de Vendas</h2>
          <p class="module-desc">
            Leitura da equipe comercial, regras por faixa (&lt; R$100: 0%, &lt; R$500: 1%, &ge; R$500: 5%) e consolidação por vendedor.
          </p>
          <div class="module-footer">
            <a routerLink="/comissoes" class="btn btn-primary" id="btn-nav-comissoes">
              <span>Abrir Módulo</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

        <!-- Card Estoque -->
        <div class="card card-interactive module-card">
          <div class="card-glow glow-cyan"></div>
          <div class="module-header">
            <div class="module-icon icon-cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <span class="badge badge-cyan">Exercício 2</span>
          </div>
          <h2 class="module-title">Controle de Estoque</h2>
          <p class="module-desc">
            Lançamento de entradas e saídas de mercadorias com validação de saldo, IDs sequenciais únicos e histórico em tempo real.
          </p>
          <div class="module-footer">
            <a routerLink="/estoque" class="btn btn-cyan" id="btn-nav-estoque">
              <span>Abrir Estoque</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

        <!-- Card Juros -->
        <div class="card card-interactive module-card">
          <div class="card-glow glow-purple"></div>
          <div class="module-header">
            <div class="module-icon icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span class="badge badge-purple">Exercício 3</span>
          </div>
          <h2 class="module-title">Cálculo de Juros</h2>
          <p class="module-desc">
            Cálculo determinístico de juros simples com multa diária de 2,5% sobre o valor original a partir da data de vencimento.
          </p>
          <div class="module-footer">
            <a routerLink="/juros" class="btn btn-secondary" id="btn-nav-juros">
              <span>Calcular Juros</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Resumo da Arquitetura -->
      <div class="card architecture-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Arquitetura da Solução Full Stack</h3>
            <p class="card-subtitle">Construído com boas práticas, testes automatizados e tecnologias modernas</p>
          </div>
          <span class="badge badge-success">Arquitetura v2</span>
        </div>
        <div class="architecture-specs">
          <div class="spec-item">
            <span class="spec-label">Backend</span>
            <span class="spec-value">ASP.NET Core .NET 8 (Minimal APIs, LINQ, ProblemDetails RFC 7807)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Frontend</span>
            <span class="spec-value">Angular 22 Standalone, Signals reativos, CSS Nativo Glassmorphism</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Testes Automatizados</span>
            <span class="spec-value">xUnit (73 testes unitários e de integração com WebApplicationFactory)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Documentação</span>
            <span class="spec-value">OpenAPI / Swagger em /swagger</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-intro {
      max-width: 800px;
    }

    .intro-badge {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-description {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .module-card {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .card-glow {
      position: absolute;
      top: 0;
      right: 0;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      filter: blur(50px);
      pointer-events: none;
      opacity: 0.15;
    }
    .glow-indigo { background: var(--primary); }
    .glow-cyan { background: var(--accent-cyan); }
    .glow-purple { background: var(--accent-purple); }

    .module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .module-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-indigo {
      background: var(--primary-light);
      color: var(--primary);
    }
    .icon-cyan {
      background: var(--accent-cyan-light);
      color: var(--accent-cyan);
    }
    .icon-purple {
      background: var(--accent-purple-light);
      color: var(--accent-purple);
    }

    .module-title {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .module-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .module-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }

    .architecture-specs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 0.85rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .spec-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-cyan);
    }

    .spec-value {
      font-size: 0.9rem;
      color: var(--text-primary);
      line-height: 1.4;
    }
  `]
})
export class DashboardComponent {}
