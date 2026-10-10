import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard – Target Sistemas'
      },
      {
        path: 'comissoes',
        loadComponent: () => import('./pages/comissoes/comissoes.component').then(m => m.ComissoesComponent),
        title: 'Comissões – Target Sistemas'
      },
      {
        path: 'estoque',
        loadComponent: () => import('./pages/estoque/estoque.component').then(m => m.EstoqueComponent),
        title: 'Estoque – Target Sistemas'
      },
      {
        path: 'juros',
        loadComponent: () => import('./pages/juros/juros.component').then(m => m.JurosComponent),
        title: 'Cálculo de Juros – Target Sistemas'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
