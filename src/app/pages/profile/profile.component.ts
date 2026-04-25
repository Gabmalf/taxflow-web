import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user = {
    fullName: 'Gabriel Usuario',
    email: 'gabriel@ejemplo.com',
    ruc: '10123456781',
    lastDigitRuc: '1',
    rentType: 'Ambas',
    preferredCurrency: 'Soles'
  };

  editMode = false;

  toggleEdit() {
    this.editMode = !this.editMode;
    // Mock save logic could go here
  }
}
