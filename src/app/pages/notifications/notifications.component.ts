import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {
    this.notificationService.notifications$
      .subscribe((n: Notification[]) => this.notifications = n);
  }

  markAsRead(notif: Notification): void {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.id);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
