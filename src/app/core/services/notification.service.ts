import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { UserService } from './user.service';

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
  private userService = inject(UserService);

  private localNotifications: Notification[] | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  getNotifications(): Observable<Notification[]> {
    if (!this.localNotifications) {
      this.localNotifications = this.generateDynamicNotifications();
      this.notificationsSubject.next(this.localNotifications);
    }
    return this.notificationsSubject.asObservable();
  }

  markAsRead(id: number): Observable<any> {
    if (this.localNotifications) {
      const notif = this.localNotifications.find(n => n.id === id);
      if (notif) {
        notif.isRead = true;
      }
      this.notificationsSubject.next(this.localNotifications);
    }
    return of({ success: true });
  }

  markAllAsRead(): Observable<any> {
    if (this.localNotifications) {
      this.localNotifications.forEach(n => n.isRead = true);
      this.notificationsSubject.next(this.localNotifications);
    }
    return of({ success: true });
  }

  private generateDynamicNotifications(): Notification[] {
    const user = this.userService.getUser();
    const digit = Number(user.lastDigitRuc || 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    
    const notifications: Notification[] = [];
    let notifId = 1;

    notifications.push({
      id: notifId++,
      title: 'Bienvenido a TAXFLOW',
      message: 'Complete su perfil tributario para empezar a simular sus impuestos de manera precisa.',
      type: 'Alerta',
      date: new Date(year, today.getMonth(), today.getDate() - 5).toISOString(),
      isRead: false
    });

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    for (let month = 1; month <= 12; month++) {
      let dueMonth = month;
      let dueYear = year;
      if (dueMonth === 12) {
        dueMonth = 0;
        dueYear++;
      }
      
      const dueDate = new Date(dueYear, dueMonth, 14 + digit);
      dueDate.setHours(0, 0, 0, 0);
      
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 0) {
        // Vencido
        if (daysDiff > -90) { // Only show recent overdue
          const overdueDate = new Date(dueDate);
          overdueDate.setDate(dueDate.getDate() + 1); // Notificamos 1 día después de vencer
          notifications.push({
            id: notifId++,
            title: 'Declaración Vencida',
            message: `Su declaración mensual de ${months[month-1]} venció el ${dueDate.toLocaleDateString('es-PE')}. Declare lo antes posible para evitar multas.`,
            type: 'Vencimiento',
            date: overdueDate.toISOString(),
            isRead: false
          });
        }
      } else if (daysDiff <= 15) {
        // Próximo
        notifications.push({
          id: notifId++,
          title: 'Vencimiento Próximo',
          message: `Su declaración mensual de ${months[month-1]} vence en ${daysDiff} días (${dueDate.toLocaleDateString('es-PE')}). Recuerde declarar a tiempo.`,
          type: 'Vencimiento',
          date: today.toISOString(),
          isRead: false
        });
      }
    }
    
    // Sort by date descending
    return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
