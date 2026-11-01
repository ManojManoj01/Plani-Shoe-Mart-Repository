import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  public toasts = this.toastsSignal.asReadonly();

  public show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string, duration = 3500): void {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message, duration };

    this.toastsSignal.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  public success(message: string, title = 'Success'): void {
    this.show(message, 'success', title);
  }

  public error(message: string, title = 'Error'): void {
    this.show(message, 'error', title, 4500);
  }

  public info(message: string, title = 'Notice'): void {
    this.show(message, 'info', title);
  }

  public warning(message: string, title = 'Warning'): void {
    this.show(message, 'warning', title);
  }

  public dismiss(id: string): void {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }
}
