import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ValidationProblemDetails } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Ignora erros de polling de health check para não poluir a interface
        if (req.url.includes('/api/health')) {
          return throwError(() => error);
        }

        let titulo = 'Erro na requisição';
        let mensagem = 'Ocorreu um erro ao comunicar com o servidor.';

        if (error.status === 0) {
          titulo = 'Falha de Conexão';
          mensagem = 'Não foi possível conectar à API backend (http://localhost:5000). Verifique se o backend está em execução.';
        } else if (error.error && typeof error.error === 'object') {
          const problem = error.error as ValidationProblemDetails;
          titulo = problem.title || `Erro ${error.status}`;

          if (problem.errors && Object.keys(problem.errors).length > 0) {
            const mensagensErros = Object.values(problem.errors).flat();
            mensagem = mensagensErros.join(' ');
          } else if (problem.detail) {
            mensagem = problem.detail;
          }
        } else if (typeof error.error === 'string') {
          mensagem = error.error;
        }

        toastService.error(titulo, mensagem);
      }

      return throwError(() => error);
    })
  );
};
