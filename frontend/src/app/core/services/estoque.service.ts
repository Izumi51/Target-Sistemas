import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto, Movimentacao, NovaMovimentacao, ResultadoMovimentacao } from '../models/estoque.model';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/estoque`;

  listarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.baseUrl}/produtos`);
  }

  listarMovimentacoes(codigoProduto?: number): Observable<Movimentacao[]> {
    let params = new HttpParams();
    if (codigoProduto != null) {
      params = params.set('codigoProduto', codigoProduto.toString());
    }
    return this.http.get<Movimentacao[]>(`${this.baseUrl}/movimentacoes`, { params });
  }

  lancarMovimentacao(nova: NovaMovimentacao): Observable<ResultadoMovimentacao> {
    return this.http.post<ResultadoMovimentacao>(`${this.baseUrl}/movimentacoes`, nova);
  }
}
