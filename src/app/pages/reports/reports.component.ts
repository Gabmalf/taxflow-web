import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeService } from '../../core/services/income.service';
import { ExpenseService } from '../../core/services/expense.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  month: string;
  year: number;
  monthIndex: number;
  income: number;
  expense: number;
  tax: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reports: ReportData[] = [];
  
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      incomes: this.incomeService.getIncomes(),
      expenses: this.expenseService.getExpenses()
    }).subscribe(({ incomes, expenses }) => {
      const grouped = new Map<string, ReportData>();
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      incomes.forEach(inc => {
        // Fix string date to ensure correct local parsing
        const dateStr = inc.date.includes('T') ? inc.date : `${inc.date}T12:00:00`;
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!grouped.has(key)) {
          grouped.set(key, { month: monthNames[d.getMonth()], year: d.getFullYear(), monthIndex: d.getMonth(), income: 0, expense: 0, tax: 0 });
        }
        const g = grouped.get(key)!;
        g.income += inc.amount;
        if (inc.hasRetention) {
          g.tax += inc.amount * 0.08;
        }
      });

      expenses.forEach(exp => {
        const dateStr = exp.date.includes('T') ? exp.date : `${exp.date}T12:00:00`;
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!grouped.has(key)) {
          grouped.set(key, { month: monthNames[d.getMonth()], year: d.getFullYear(), monthIndex: d.getMonth(), income: 0, expense: 0, tax: 0 });
        }
        const g = grouped.get(key)!;
        g.expense += exp.amount;
      });

      this.reports = Array.from(grouped.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex - a.monthIndex;
      });
    });
  }

  exportReport() {
    const doc = new jsPDF();
    doc.text('Reporte Consolidado de Actividad Tributaria - TaxFlow', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Periodo', 'Total Ingresos (S/)', 'Total Gastos (S/)', 'Impuesto Estimado (S/)']],
      body: this.reports.map(r => [
        `${r.month} ${r.year}`,
        r.income.toFixed(2),
        r.expense.toFixed(2),
        r.tax.toFixed(2)
      ]),
    });

    doc.save('TaxFlow_Reporte_Consolidado.pdf');
  }

  exportDetail(report: ReportData) {
    const doc = new jsPDF();
    doc.text(`Detalle de Periodo: ${report.month} ${report.year} - TaxFlow`, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Ingresos Totales: S/ ${report.income.toFixed(2)}`, 14, 35);
    doc.text(`Gastos Deducibles: S/ ${report.expense.toFixed(2)}`, 14, 45);
    doc.text(`Impuesto Estimado (Retenciones 8%): S/ ${report.tax.toFixed(2)}`, 14, 55);

    doc.save(`TaxFlow_Detalle_${report.month}_${report.year}.pdf`);
  }
}
