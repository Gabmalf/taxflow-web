import { Component, inject } from '@angular/core';
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
export class TopbarComponent {

  private readonly sidebarService = inject(SidebarService);
  readonly sidebarCollapsed = this.sidebarService.collapsed;

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}