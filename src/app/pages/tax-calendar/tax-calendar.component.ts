import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deadline } from '../../core/models/models';

@Component({
  selector: 'app-tax-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax-calendar.component.html',
  styleUrl: './tax-calendar.component.css'
})
export class TaxCalendarComponent implements OnInit {
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = 2026;
  rucDigit = '1';

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];
  years = [2026];
  digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  mockDeadlines: Deadline[] = [];

  ngOnInit() {
    this.generateMockDeadlines();
  }

  generateMockDeadlines() {
    this.mockDeadlines = [];
    let idCounter = 1;
    const today = new Date();
    
    for (let year of this.years) {
      for (let d = 0; d <= 9; d++) {
        for (let m = 1; m <= 12; m++) {
          // El vencimiento suele ser al mes siguiente
          const dueMonth = m === 12 ? 1 : m + 1;
          const dueYear = m === 12 ? year + 1 : year;
          const dueDay = 12 + d; // Días simulados: 12 al 21
          
          const deadlineDate = new Date(dueYear, dueMonth - 1, dueDay);
          let status: 'Pendiente' | 'Proximo' | 'Vencido' | 'Cumplido';
          
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            status = 'Vencido';
            // Aleatoriamente marcar algunos como cumplidos si ya pasaron
            if (m % 2 === 0) status = 'Cumplido'; 
          } else if (diffDays <= 15) {
            status = 'Proximo';
          } else {
            status = 'Pendiente';
          }

          const dateString = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}T00:00:00`;
          
          this.mockDeadlines.push({
            id: (idCounter++).toString(),
            month: m,
            year: year,
            lastDigit: d,
            deadlineDate: dateString,
            status: status
          });
        }
      }
    }
  }

  get filteredDeadlines() {
    return this.mockDeadlines.filter(d => 
      d.lastDigit.toString() === this.rucDigit &&
      d.year === Number(this.selectedYear)
    ).sort((a, b) => a.month - b.month);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pendiente': return 'bg-secondary';
      case 'Proximo': return 'bg-warning text-dark';
      case 'Vencido': return 'bg-danger';
      case 'Cumplido': return 'bg-success';
      default: return 'bg-primary';
    }
  }
}
