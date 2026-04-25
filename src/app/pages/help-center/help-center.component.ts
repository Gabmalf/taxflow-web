import { Component } from '@angular/core';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.css'
})
export class HelpCenterComponent {
  submitQuery() {
    alert('Tu consulta ha sido enviada. Te responderemos en breve.');
  }
}
