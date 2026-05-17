import { Component, inject, OnInit } from '@angular/core';
import { Expense } from '../../core/models/models';
import { ExpenseService } from '../../core/services/expense.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  private expenseService = inject(ExpenseService);

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
      },
      error: (err) => console.error('Error loading expenses', err)
    });
  }

  deleteExpense(id: string) {
    if (confirm('¿Estás seguro de eliminar este gasto deducible?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => this.loadExpenses(),
        error: (err) => console.error('Error deleting expense', err)
      });
    }
  }
}
