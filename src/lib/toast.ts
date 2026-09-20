/**
 * Global toast queue, following the same external-store pattern as the
 * locale store in `@/i18n` (a plain module-level store read via
 * `useSyncExternalStore`, so any component can push a toast without a
 * provider/context tree).
 */
import { useSyncExternalStore } from "react";

export type ToastVariant = "error" | "success" | "info";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DEFAULT_DURATION = 5000;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

function getServerSnapshot(): ToastItem[] {
  return [];
}

export function showToast(
  message: string,
  variant: ToastVariant = "error",
  duration = DEFAULT_DURATION,
): void {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  emit();
  window.setTimeout(() => dismissToast(id), duration);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

/** Subscribes the calling component to the live toast queue. */
export function useToasts(): ToastItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
