import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.css'
})
export class PrivateLayoutComponent {

}
