import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  private readonly sidebarService = inject(SidebarService);
  readonly sidebarCollapsed = this.sidebarService.collapsed;

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
