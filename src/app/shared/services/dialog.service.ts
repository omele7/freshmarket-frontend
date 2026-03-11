import { Injectable, signal } from '@angular/core';
import { DialogConfig } from '../components/confirm-dialog/confirm-dialog.component';
import { ToastConfig, ToastType } from '../components/toast/toast.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  // Confirm dialog state
  readonly dialogConfig = signal<DialogConfig | null>(null);
  private resolveDialog: ((value: boolean) => void) | null = null;

  // Toast state
  readonly toastConfig = signal<ToastConfig | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Show a confirm dialog. Returns a Promise<boolean>.
   */
  confirm(config: DialogConfig): Promise<boolean> {
    this.dialogConfig.set(config);
    return new Promise<boolean>((resolve) => {
      this.resolveDialog = resolve;
    });
  }

  /** Called when user clicks Confirm */
  onConfirm(): void {
    this.resolveDialog?.(true);
    this.dialogConfig.set(null);
    this.resolveDialog = null;
  }

  /** Called when user clicks Cancel / backdrop */
  onCancel(): void {
    this.resolveDialog?.(false);
    this.dialogConfig.set(null);
    this.resolveDialog = null;
  }

  /**
   * Show a toast notification for `duration` ms (default 3 s).
   */
  toast(message: string, type: ToastType = 'info', duration = 3000): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastConfig.set({ message, type });
    this.toastTimer = setTimeout(() => this.toastConfig.set(null), duration);
  }
}
