import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  config = input.required<DialogConfig>();
  confirmed = output<void>();
  cancelled = output<void>();

  get icon(): string {
    if (this.config().icon) return this.config().icon!;
    const icons: Record<string, string> = {
      danger: '🗑️',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️',
    };
    return icons[this.config().type ?? 'warning'] ?? '❓';
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.cancelled.emit();
    }
  }
}
