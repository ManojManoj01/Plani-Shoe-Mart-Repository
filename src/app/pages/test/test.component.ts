import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendService } from '../../core/services/backend.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-xl mx-auto my-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">Backend API Health Test</h3>
        <button
          type="button"
          (click)="checkConnection()"
          [disabled]="isLoading()"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-50"
        >
          {{ isLoading() ? 'Testing...' : 'Retest' }}
        </button>
      </div>

      <div
        class="p-4 rounded-xl border flex items-center gap-3"
        [ngClass]="{
          'bg-amber-50 border-amber-200 text-amber-800': isLoading(),
          'bg-emerald-50 border-emerald-200 text-emerald-800': !isLoading() && !isError(),
          'bg-rose-50 border-rose-200 text-rose-800': !isLoading() && isError()
        }"
      >
        <span
          class="inline-block w-3 h-3 rounded-full flex-shrink-0"
          [ngClass]="{
            'bg-amber-500 animate-pulse': isLoading(),
            'bg-emerald-500': !isLoading() && !isError(),
            'bg-rose-500': !isLoading() && isError()
          }"
        ></span>
        <div class="flex-1 font-mono text-xs break-all">
          {{ connectionMessage() }}
        </div>
      </div>
    </div>
  `
})
export class TestComponent implements OnInit {
  private backendService = inject(BackendService);

  connectionMessage = signal<string>('Connecting...');
  isError = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.checkConnection();
  }

  checkConnection(): void {
    this.isLoading.set(true);
    this.connectionMessage.set('Connecting to http://localhost:8080/api/test...');
    this.isError.set(false);

    this.backendService.testConnection().subscribe({
      next: (data) => {
        this.connectionMessage.set(data || 'Connected successfully!');
        this.isError.set(false);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.connectionMessage.set(`Backend connection failed (${error.status ?? 'Network Error'})`);
        this.isError.set(true);
        this.isLoading.set(false);
        console.error('Backend connection error:', error);
      }
    });
  }
}
