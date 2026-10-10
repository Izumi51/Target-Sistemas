import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [ngClass]="{ 'overlay': overlay }">
      <div class="spinner">
        <div class="spinner-ring outer"></div>
        <div class="spinner-ring inner"></div>
      </div>
      @if (message) {
        <p class="loader-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }

    .loader-container.overlay {
      position: absolute;
      inset: 0;
      background: rgba(8, 12, 20, 0.7);
      backdrop-filter: blur(8px);
      z-index: 50;
      border-radius: inherit;
    }

    .spinner {
      position: relative;
      width: 44px;
      height: 44px;
    }

    .spinner-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid transparent;
    }

    .spinner-ring.outer {
      border-top-color: var(--primary);
      border-right-color: var(--accent-cyan);
      animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
    }

    .spinner-ring.inner {
      inset: 6px;
      border-bottom-color: var(--accent-purple);
      border-left-color: var(--primary);
      animation: spinReverse 0.8s linear infinite;
    }

    .loader-message {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes spinReverse {
      to { transform: rotate(-360deg); }
    }
  `]
})
export class LoaderComponent {
  @Input() message = 'Carregando dados...';
  @Input() overlay = false;
}
