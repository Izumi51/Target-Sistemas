import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type ApiStatus = 'online' | 'offline' | 'checking';

@Injectable({
  providedIn: 'root'
})
export class ApiStatusService {
  private readonly http = inject(HttpClient);
  
  private readonly _status = signal<ApiStatus>('checking');
  readonly status = this._status.asReadonly();

  private readonly _lastChecked = signal<Date | null>(null);
  readonly lastChecked = this._lastChecked.asReadonly();

  checkHealth(): void {
    this._status.set('checking');
    this.http.get<{ status: string }>(`${environment.apiUrl}/health`).subscribe({
      next: (res) => {
        this._status.set(res?.status === 'ok' ? 'online' : 'offline');
        this._lastChecked.set(new Date());
      },
      error: () => {
        this._status.set('offline');
        this._lastChecked.set(new Date());
      }
    });
  }
}
