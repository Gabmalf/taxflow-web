import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deadline } from '../../core/models/models';
import { CalendarService } from '../../core/services/calendar.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-tax-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax-calendar.component.html',
  styleUrl: './tax-calendar.component.css'
})
export class TaxCalendarComponent implements OnInit {
  private calendarService = inject(CalendarService);
  private userService = inject(UserService);

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
    const user = this.userService.getUser();
    this.rucDigit = user.lastDigitRuc?.toString() || '1';

    // Fetch the calendar but we will dynamically override it 
    // to simulate real dates based on current date for academic purposes.
    this.calendarService.getCalendar().subscribe({
      next: (data) => {
        this.generateDynamicCalendar();
      },
      error: (err) => {
        console.error('Error fetching calendar', err);
        this.generateDynamicCalendar();
      }
    });
  }

  generateDynamicCalendar() {
    const year = Number(this.selectedYear);
    const digit = Number(this.rucDigit);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    this.mockDeadlines = [];
    
    for (let month = 1; month <= 12; month++) {
      let dueMonth = month; 
      let dueYear = year;
      if (dueMonth === 12) {
        dueMonth = 0;
        dueYear++;
      }
      
      const dueDate = new Date(dueYear, dueMonth, 14 + digit);
      dueDate.setHours(0,0,0,0);
      
      let status: 'Pendiente' | 'Proximo' | 'Vencido' | 'Cumplido' = 'Pendiente';
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 0) {
        status = 'Vencido';
      } else if (daysDiff <= 15) {
        status = 'Proximo';
      } else {
        status = 'Pendiente';
      }

      this.mockDeadlines.push({
        id: month.toString(),
        month: month,
        year: year,
        lastDigit: digit,
        deadlineDate: dueDate.toISOString(),
        status: status
      });
    }
  }

  get filteredDeadlines() {
    if (this.mockDeadlines.length === 0 || this.mockDeadlines[0].year !== Number(this.selectedYear)) {
      this.generateDynamicCalendar();
    }
    return this.mockDeadlines;
  }

  getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'bg-secondary';
      case 'proximo': return 'bg-warning text-dark';
      case 'vencido': return 'bg-danger';
      case 'cumplido': return 'bg-success';
      default: return 'bg-primary';
    }
  }
}
