import { Component } from '@angular/core';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [],
  templateUrl: './accessibility.component.html',
  styleUrl: './accessibility.component.css'
})
export class AccessibilityComponent {
  highContrast = false;
  largeFont = false;
  simpleReading = false;

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    if (this.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  toggleLargeFont() {
    this.largeFont = !this.largeFont;
    if (this.largeFont) {
      document.body.classList.add('large-font');
    } else {
      document.body.classList.remove('large-font');
    }
  }

  toggleSimpleReading() {
    this.simpleReading = !this.simpleReading;
  }
}
