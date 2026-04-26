import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  date: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSubject = new BehaviorSubject<Notification[]>([
    { id: 1, title: 'Vencimiento próximo', message: 'Tu declaración mensual vence en 5 días.', type: 'Vencimiento', date: 'Hace 2 horas', isRead: false },
    { id: 2, title: 'Nueva normativa', message: 'Se ha actualizado el valor de la UIT para 2026.', type: 'Normativa', date: 'Hace 1 día', isRead: false },
    { id: 3, title: 'Comprobante registrado', message: 'Tu factura de restaurante ha sido procesada correctamente.', type: 'Comprobante', date: 'Hace 3 días', isRead: false }
  ]);

  notifications$ = this.notificationsSubject.asObservable();

  markAsRead(id: number): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  }

  markAllAsRead(): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n => ({ ...n, isRead: true }))
    );
  }
}
