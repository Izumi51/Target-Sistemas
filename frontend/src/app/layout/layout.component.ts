import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div class="app-layout">
      <app-sidebar [isOpen]="isSidebarOpen" (closeSidebar)="isSidebarOpen = false"></app-sidebar>
      
      @if (isSidebarOpen) {
        <div class="sidebar-backdrop" (click)="isSidebarOpen = false"></div>
      }

      <div class="layout-main">
        <app-header (toggleSidebar)="isSidebarOpen = !isSidebarOpen"></app-header>
        
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-app);
    }

    .layout-main {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin-left var(--transition-smooth);
    }

    .content-area {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 95;
    }

    @media (max-width: 900px) {
      .layout-main {
        margin-left: 0;
      }
      .sidebar-backdrop {
        display: block;
      }
      .content-area {
        padding: 1.25rem 1rem;
      }
    }
  `]
})
export class LayoutComponent {
  isSidebarOpen = false;
}
