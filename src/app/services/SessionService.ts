import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {

  set(key: string, value: any): void {
    if (value === undefined || value === null) {
      sessionStorage.removeItem(key);
      return;
    }

    sessionStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);

    if (!item || item === "undefined" || item === "null") {
      return null;
    }

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`SessionService: Invalid JSON for key "${key}"`, item);
      return null;
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}
