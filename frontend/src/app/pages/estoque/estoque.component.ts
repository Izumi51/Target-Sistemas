import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="estoque-page animate-fade-in">
      <div class="page-header">
        <div>
          <span class="badge badge-cyan">Exercício 2</span>
          <h1 class="page-title">Gestão de Estoque do Depósito</h1>
          <p class="page-subtitle">Visualização de saldo, histórico de lançamentos e controle de entradas e saídas.</p>
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
export class EstoqueComponent {}
