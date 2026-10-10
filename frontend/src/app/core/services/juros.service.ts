import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResultadoJuros } from '../models/juros.model';

@Injectable({
  providedIn: 'root'
})
export class JurosService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/juros`;

  calcular(valor: number, vencimento: string): Observable<ResultadoJuros> {
    const params = new HttpParams()
      .set('valor', valor.toString())
      .set('vencimento', vencimento);

    return this.http.get<ResultadoJuros>(this.endpoint, { params });
  }
}
