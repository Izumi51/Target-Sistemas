import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiStatusService } from '../../core/services/api-status.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.open]="isOpen">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">TARGET</span>
          <span class="brand-subtitle">SISTEMAS</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">MÓDULOS DO SISTEMA</div>

        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item" (click)="onItemClick()">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span class="nav-label">Dashboard</span>
        </a>

        <a routerLink="/comissoes" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </span>
          <span class="nav-label">Comissões</span>
          <span class="badge badge-indigo">Ex. 1</span>
        </a>

        <a routerLink="/estoque" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
          </span>
          <span class="nav-label">Estoque</span>
          <span class="badge badge-cyan">Ex. 2</span>
        </a>

        <a routerLink="/juros" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <span class="nav-label">Cálculo de Juros</span>
          <span class="badge badge-purple">Ex. 3</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="api-status-card">
          <div class="status-indicator">
            <span class="status-dot" [ngClass]="apiStatusService.status()"></span>
            <span class="status-text">
              API Backend:
              <strong>
                @switch (apiStatusService.status()) {
                  @case ('online') { Online }
                  @case ('offline') { Offline }
                  @default { Conectando... }
                }
              </strong>
            </span>
          </div>
          <a href="http://localhost:5000/swagger" target="_blank" rel="noopener" class="swagger-link" title="Abrir Swagger da API">
            <span>Swagger API</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--bg-sidebar);
      backdrop-filter: var(--backdrop-blur);
      -webkit-backdrop-filter: var(--backdrop-blur);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: transform var(--transition-smooth);
    }

    .sidebar-brand {
      height: 72px;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: var(--accent-cyan);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      padding: 0.5rem 0.75rem;
      margin-bottom: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 0.9rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
      transition: all var(--transition-fast);
      position: relative;
    }

    .nav-item:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-item.active {
      color: #ffffff;
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .nav-item.active .nav-icon {
      color: var(--accent-cyan);
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      transition: color var(--transition-fast);
    }

    .nav-label {
      flex: 1;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }

    .api-status-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
      position: relative;
    }

    .status-dot.online {
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }

    .status-dot.offline {
      background: var(--danger);
      box-shadow: 0 0 8px var(--danger);
    }

    .status-dot.checking {
      background: var(--warning);
      animation: pulseGlow 1.5s infinite;
    }

    .swagger-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--accent-cyan);
      padding-top: 0.35rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .swagger-link:hover {
      color: #67e8f9;
      text-decoration: underline;
    }

    @media (max-width: 900px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
        box-shadow: var(--shadow-lg);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  readonly apiStatusService = inject(ApiStatusService);

  onItemClick(): void {
    if (window.innerWidth <= 900) {
      this.closeSidebar.emit();
    }
  }
}
