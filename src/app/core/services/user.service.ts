import { Injectable } from '@angular/core';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private storageKey = 'taxflow_user';

  private readonly defaultUser: User = {
    id: '1',
    fullName: 'Gabriel Usuario',
    email: 'gabriel@ejemplo.com',
    ruc: '10123456781',
    lastDigitRuc: 1,
    rentType: 'Ambas',
    preferredCurrency: 'Soles'
  };

  getUser(): User {
    const data = localStorage.getItem(this.storageKey);
    const stored = data ? JSON.parse(data) : {};
    
    // Mapeo de datos del backend al modelo User de Angular
    if (stored.nombres && stored.apellidos) {
      stored.fullName = `${stored.nombres} ${stored.apellidos}`;
    }
    if (stored.correo) {
      stored.email = stored.correo;
    }
    if (stored.ruc) {
      stored.lastDigitRuc = parseInt(stored.ruc.slice(-1), 10);
    }

    return { ...this.defaultUser, ...stored };
  }

  updateUser(user: User): void {
    const current = this.getUser();
    localStorage.setItem(this.storageKey, JSON.stringify({ ...current, ...user }));
  }
}
