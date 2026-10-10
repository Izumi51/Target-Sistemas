import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ApiStatusService } from '../../core/services/api-status.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar.emit()" aria-label="Abrir menu de navegação">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div class="header-breadcrumbs">
          <span class="breadcrumb-root">Sistema</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ currentTitle }}</span>
        </div>
      </div>

      <div class="header-right">
        <div class="today-date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{{ todayFormatted }}</span>
        </div>

        <button class="btn btn-outline btn-sm" (click)="refreshHealth()" title="Verificar status da API">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span class="btn-text">Testar Conexão</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 72px;
      background: var(--bg-header);
      backdrop-filter: var(--backdrop-blur);
      -webkit-backdrop-filter: var(--backdrop-blur);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      display: none;
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      padding: 0.4rem;
      border-radius: var(--radius-sm);
    }

    .menu-toggle:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .header-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    .breadcrumb-root {
      color: var(--text-muted);
    }

    .breadcrumb-separator {
      color: var(--text-muted);
      opacity: 0.5;
    }

    .breadcrumb-current {
      color: var(--text-primary);
      font-weight: 600;
      font-family: var(--font-heading);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .today-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
      background: rgba(15, 23, 42, 0.6);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-subtle);
    }

    .btn-sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.8rem;
    }

    @media (max-width: 900px) {
      .menu-toggle {
        display: flex;
      }
      .header {
        padding: 0 1rem;
      }
      .today-date span {
        display: none;
      }
      .btn-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly apiStatusService = inject(ApiStatusService);

  currentTitle = 'Dashboard';
  todayFormatted = '';

  ngOnInit(): void {
    const hoje = new Date();
    this.todayFormatted = hoje.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    this.updateTitle(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
    });

    // Checa a API ao inicializar
    this.apiStatusService.checkHealth();
  }

  refreshHealth(): void {
    this.apiStatusService.checkHealth();
  }

  private updateTitle(url: string): void {
    if (url.includes('/comissoes')) {
      this.currentTitle = 'Cálculo de Comissões';
    } else if (url.includes('/estoque')) {
      this.currentTitle = 'Controle de Estoque';
    } else if (url.includes('/juros')) {
      this.currentTitle = 'Cálculo de Juros';
    } else {
      this.currentTitle = 'Dashboard Geral';
    }
  }
}
