import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarService } from '../../../core/services/sidebar.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterLink,
    NotificationBellComponent   // ✅ ya está bien importado
  ],
  templateUrl: './topbar.component.html', // ✅ ESTE ERA EL ERROR
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {

  private readonly sidebarService = inject(SidebarService);
  readonly sidebarCollapsed = this.sidebarService.collapsed;
  userName = 'Usuario';

  ngOnInit() {
    const userStr = localStorage.getItem('taxflow_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.nombres) {
          this.userName = user.nombres;
        } else if (user.email) {
          this.userName = user.email.split('@')[0];
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}