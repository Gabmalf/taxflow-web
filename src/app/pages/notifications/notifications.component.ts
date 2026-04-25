import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  notifications = [
    { id: 1, title: 'Vencimiento próximo', message: 'Tu declaración mensual vence en 5 días.', type: 'Vencimiento', date: 'Hace 2 horas', isRead: false },
    { id: 2, title: 'Nueva normativa', message: 'Se ha actualizado el valor de la UIT para 2026.', type: 'Normativa', date: 'Hace 1 día', isRead: false },
    { id: 3, title: 'Comprobante registrado', message: 'Tu factura de restaurante ha sido procesada correctamente.', type: 'Comprobante', date: 'Hace 3 días', isRead: true },
    { id: 4, title: 'Simulación incompleta', message: 'Tienes datos pendientes en tu simulador tributario.', type: 'Alerta', date: 'Hace 1 semana', isRead: true }
  ];

  markAsRead(notif: any) {
    notif.isRead = true;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
  }
}
