import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncomeService } from '../../core/services/income.service';
import { ExpenseService } from '../../core/services/expense.service';
import { TaxCalculatorService } from '../../core/services/tax-calculator.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userName = 'Usuario';

  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);
  private taxCalculatorService = inject(TaxCalculatorService);

  totalIncomes = 0;
  totalExpenses = 0;
  estimatedTax = 0;
  
  recentIncomes: any[] = [];
  recentExpenses: any[] = [];
  
  nextDeadlineDate: Date | null = null;
  daysUntilNextDeadline: number = 0;

  ngOnInit() {
    let rucDigit = 1;
    const userStr = localStorage.getItem('taxflow_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.nombres) {
          this.userName = user.nombres;
        } else if (user.email) {
          this.userName = user.email.split('@')[0];
        }
        
        if (user.ruc) {
          rucDigit = Number(user.ruc.toString().slice(-1));
        } else if (user.lastDigitRuc !== undefined) {
          rucDigit = Number(user.lastDigitRuc);
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    this.calculateNextDeadline(rucDigit);
    this.loadData();
  }

  calculateNextDeadline(digit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    
    let nextDate: Date | null = null;
    let minDiff = Infinity;
    
    for (let y = currentYear - 1; y <= currentYear + 1; y++) {
      for (let month = 1; month <= 12; month++) {
        let dueMonth = month; 
        let dueYear = y;
        if (dueMonth === 12) {
          dueMonth = 0;
          dueYear++;
        }
        
        const dueDate = new Date(dueYear, dueMonth, 14 + digit);
        dueDate.setHours(0, 0, 0, 0);
        
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff >= 0 && daysDiff < minDiff) {
          minDiff = daysDiff;
          nextDate = dueDate;
        }
      }
    }
    
    this.nextDeadlineDate = nextDate;
    this.daysUntilNextDeadline = minDiff;
  }

  loadData() {
    this.taxCalculatorService.simulate().subscribe(res => {
      this.totalIncomes = res.totalIncomes;
      this.totalExpenses = res.totalExpenses;
      this.estimatedTax = res.estimatedTax;
    });

    this.incomeService.getIncomes().subscribe(incomes => {
      // Sort descending by date and take top 5
      this.recentIncomes = incomes
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });

    this.expenseService.getExpenses().subscribe(expenses => {
      // Sort descending by date and take top 5
      this.recentExpenses = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });
  }
}
