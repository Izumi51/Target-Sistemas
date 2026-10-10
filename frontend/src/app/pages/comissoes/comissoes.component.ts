import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comissoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comissoes-page animate-fade-in">
      <div class="page-header">
        <div>
          <span class="badge badge-indigo">Exercício 1</span>
          <h1 class="page-title">Comissões da Equipe Comercial</h1>
          <p class="page-subtitle">Cálculo individualizado e consolidado de comissão com base no volume de vendas.</p>
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
export class ComissoesComponent {}
