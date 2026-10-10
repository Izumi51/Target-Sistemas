import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-juros',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="juros-page animate-fade-in">
      <div class="page-header">
        <div>
          <span class="badge badge-purple">Exercício 3</span>
          <h1 class="page-title">Calculadora de Juros de Mora</h1>
          <p class="page-subtitle">Cálculo de juros simples de 2,5% ao dia por dias de atraso a partir da data de vencimento.</p>
        </div>
      </div>

      <div class="card">
        <p>Módulo pronto para apresentação e integração de dados na Etapa 6.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }
    .page-title {
      font-size: 2rem;
      margin-top: 0.5rem;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
  `]
})
export class JurosComponent {}
