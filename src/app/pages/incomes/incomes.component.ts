import { Component, inject, OnInit } from '@angular/core';
import { Income } from '../../core/models/models';
import { IncomeService } from '../../core/services/income.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css'
})
export class IncomesComponent implements OnInit {
  incomes: Income[] = [];
  private incomeService = inject(IncomeService);

  ngOnInit() {
    this.loadIncomes();
  }

  loadIncomes() {
    this.incomes = this.incomeService.getIncomes();
  }

  deleteIncome(id: string) {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      this.incomeService.deleteIncome(id);
      this.loadIncomes();
    }
  }
}
