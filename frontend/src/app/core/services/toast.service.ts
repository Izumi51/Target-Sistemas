import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(type: ToastType, title: string, message: string, duration = 5000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    this._toasts.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(title: string, message: string, duration = 4000): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration = 6000): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration = 5000): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration = 4000): void {
    this.show('info', title, message, duration);
  }

  remove(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
