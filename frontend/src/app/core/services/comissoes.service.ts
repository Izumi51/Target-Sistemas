import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumoComissoes } from '../models/comissao.model';

@Injectable({
  providedIn: 'root'
})
export class ComissoesService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/comissoes`;

  obterResumo(): Observable<ResumoComissoes> {
    return this.http.get<ResumoComissoes>(this.endpoint);
  }
}
