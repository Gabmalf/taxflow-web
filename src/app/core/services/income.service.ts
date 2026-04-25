import { Injectable } from '@angular/core';
import { Income } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private storageKey = 'taxflow_incomes';

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    if (!localStorage.getItem(this.storageKey)) {
      const mockIncomes: Income[] = [
        { id: '1', type: 'Cuarta', date: '2026-05-10', amount: 2500, currency: 'Soles', description: 'Servicios de consultoría', hasRetention: true },
        { id: '2', type: 'Quinta', date: '2026-05-05', amount: 2000, currency: 'Soles', description: 'Planilla Mayo', hasRetention: false },
        { id: '3', type: 'Otro', date: '2026-04-20', amount: 500, currency: 'Soles', description: 'Venta ocasional', hasRetention: false }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(mockIncomes));
    }
  }

  getIncomes(): Income[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addIncome(income: Income) {
    const incomes = this.getIncomes();
    income.id = new Date().getTime().toString();
    incomes.push(income);
    localStorage.setItem(this.storageKey, JSON.stringify(incomes));
  }

  deleteIncome(id: string) {
    let incomes = this.getIncomes();
    incomes = incomes.filter(i => i.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(incomes));
  }
}
