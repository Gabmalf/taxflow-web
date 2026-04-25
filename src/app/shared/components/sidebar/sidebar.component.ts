import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  host: {
    '[class.collapsed]': 'collapsed()',
    '[attr.id]': '"app-sidebar"',
    '[attr.aria-hidden]': 'collapsed()'
  }
})
export class SidebarComponent {
  private readonly sidebarService = inject(SidebarService);
  readonly collapsed = this.sidebarService.collapsed;
}
