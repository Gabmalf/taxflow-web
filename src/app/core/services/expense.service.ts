import { Injectable } from '@angular/core';
import { Expense } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private storageKey = 'taxflow_expenses';

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    if (!localStorage.getItem(this.storageKey)) {
      const mockExpenses: Expense[] = [
        { id: '1', category: 'Restaurantes y hoteles', date: '2026-05-12', amount: 150, currency: 'Soles', description: 'Cena de negocios', providerRuc: '20123456789', receiptType: 'Factura Electrónica' },
        { id: '2', category: 'Servicios médicos', date: '2026-05-08', amount: 400, currency: 'Soles', description: 'Consulta odontológica', providerRuc: '10987654321', receiptType: 'Recibo por Honorarios' },
        { id: '3', category: 'Alquiler de inmueble', date: '2026-05-01', amount: 1200, currency: 'Soles', description: 'Alquiler oficina', providerRuc: '20555555555', receiptType: 'Formulario 1683' }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(mockExpenses));
    }
  }

  getExpenses(): Expense[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addExpense(expense: Expense) {
    const expenses = this.getExpenses();
    expense.id = new Date().getTime().toString();
    expenses.push(expense);
    localStorage.setItem(this.storageKey, JSON.stringify(expenses));
  }

  deleteExpense(id: string) {
    let expenses = this.getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(expenses));
  }
}
