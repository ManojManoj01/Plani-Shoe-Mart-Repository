import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
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

  public show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    this.toastsSignal.update(current => [...current, newToast]);

    const duration = toast.duration ?? 4500;
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  public success(message: string, title: string = 'Success') {
    this.show({ type: 'success', title, message });
  }

  public error(message: string, title: string = 'Error') {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  public warning(message: string, title: string = 'Warning') {
    this.show({ type: 'warning', title, message });
  }

  public info(message: string, title: string = 'Information') {
    this.show({ type: 'info', title, message });
  }

  public remove(id: string) {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }
}
