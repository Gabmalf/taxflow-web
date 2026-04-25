import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  reports = [
    { month: 'Mayo', year: 2026, income: 4500, expense: 1200, tax: 0 },
    { month: 'Abril', year: 2026, income: 5000, expense: 800, tax: 150 },
    { month: 'Marzo', year: 2026, income: 4200, expense: 1500, tax: 0 }
  ];

  exportReport() {
    alert('Reporte generado correctamente. La descarga comenzará en breve.');
  }
}
