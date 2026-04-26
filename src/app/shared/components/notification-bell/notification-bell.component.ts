import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent {

  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.notificationService.notifications$
      .subscribe((list: Notification[]) => {
        this.notifications = list;
      });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  /** ✅ Navegación segura */
  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}