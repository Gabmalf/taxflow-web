import { Component } from '@angular/core';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [],
  templateUrl: './accessibility.component.html',
  styleUrl: './accessibility.component.css'
})
export class AccessibilityComponent {
  colorblindMode = false;

  toggleColorblindMode() {
    this.colorblindMode = !this.colorblindMode;
    if (this.colorblindMode) {
      document.body.classList.add('colorblind-mode');
    } else {
      document.body.classList.remove('colorblind-mode');
    }
  }
}
