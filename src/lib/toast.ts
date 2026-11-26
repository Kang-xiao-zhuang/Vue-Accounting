"use client";

import { create } from "zustand";

export interface ToastOptions {
  /** 右侧操作按钮文案，例如「撤销」 */
  actionLabel?: string;
  onAction?: () => void;
  /** 毫秒；带操作时默认停留更久，给用户反应时间 */
  duration?: number;
}

interface ToastState {
  message: string | null;
  options: ToastOptions;
  show: (message: string, options?: ToastOptions) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  options: {},
  show: (message, options = {}) => set({ message, options }),
  hide: () => set({ message: null, options: {} }),
}));

export function toast(message: string, options?: ToastOptions): void {
  useToastStore.getState().show(message, options);
}
