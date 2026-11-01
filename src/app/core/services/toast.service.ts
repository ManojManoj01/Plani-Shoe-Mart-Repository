import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
<<<<<<< HEAD
  type: 'success' | 'error' | 'info' | 'warning';
=======
  type: 'success' | 'error' | 'warning' | 'info';
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }
}
