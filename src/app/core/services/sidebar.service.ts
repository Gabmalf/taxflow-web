import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'taxflow.sidebar.collapsed';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  readonly collapsed = signal<boolean>(this.readInitialState());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.collapsed()));
      } catch {
        // localStorage unavailable (SSR, private mode) — ignore
      }
    });
  }

  toggle(): void {
    this.collapsed.update(v => !v);
  }

  open(): void {
    this.collapsed.set(false);
  }

  close(): void {
    this.collapsed.set(true);
  }

  private readInitialState(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === null ? false : JSON.parse(raw) === true;
    } catch {
      return false;
    }
  }
}
