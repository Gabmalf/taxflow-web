import { Injectable, inject } from '@angular/core';
import { IncomeService } from './income.service';
import { ExpenseService } from './expense.service';
import { TaxSimulationResult } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TaxCalculatorService {
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  readonly UIT = 5500;
  readonly DEDUCTION_7_UIT = this.UIT * 7;
  readonly MAX_ADDITIONAL_DEDUCTION = this.UIT * 3;

  simulate(): TaxSimulationResult {
    const incomes = this.incomeService.getIncomes();
    const expenses = this.expenseService.getExpenses();

    // 1. Calcular rentas
    let rentaBruta4ta = 0;
    let rentaBruta5ta = 0;

    incomes.forEach(i => {
      // Simplificación: solo sumamos soles para este mock
      if (i.currency === 'Soles') {
        if (i.type === 'Cuarta') rentaBruta4ta += i.amount;
        if (i.type === 'Quinta') rentaBruta5ta += i.amount;
      }
    });

    // Deducción 20% para 4ta (hasta un límite de 24 UIT, aquí simplificado)
    const rentaNeta4ta = rentaBruta4ta * 0.8;
    const totalRentas = rentaNeta4ta + rentaBruta5ta;

    // 2. Gastos Deducibles
    let totalExpenses = 0;
    expenses.forEach(e => {
      if (e.currency === 'Soles') {
        totalExpenses += e.amount;
      }
    });
    // Limitar a 3 UIT
    const validDeduction = Math.min(totalExpenses, this.MAX_ADDITIONAL_DEDUCTION);

    // 3. Renta Neta Imponible
    let rentaNetaImponible = totalRentas - this.DEDUCTION_7_UIT - validDeduction;
    if (rentaNetaImponible < 0) rentaNetaImponible = 0;

    // 4. Cálculo del Impuesto (Tramos)
    let estimatedTax = 0;
    let remaining = rentaNetaImponible;

    const tramos = [
      { max: 5 * this.UIT, rate: 0.08 },
      { max: 20 * this.UIT, rate: 0.14 },
      { max: 35 * this.UIT, rate: 0.17 },
      { max: 45 * this.UIT, rate: 0.20 },
      { max: Infinity, rate: 0.30 }
    ];

    let currentTramoMin = 0;
    for (const tramo of tramos) {
      if (remaining <= 0) break;
      const amountInTramo = Math.min(remaining, tramo.max - currentTramoMin);
      estimatedTax += amountInTramo * tramo.rate;
      remaining -= amountInTramo;
      currentTramoMin = tramo.max;
    }

    return {
      totalIncomes: rentaBruta4ta + rentaBruta5ta,
      totalExpenses: totalExpenses,
      netRent: totalRentas,
      deduction7UIT: totalRentas > 0 ? Math.min(totalRentas, this.DEDUCTION_7_UIT) : 0,
      additionalDeduction: validDeduction,
      estimatedTax: estimatedTax,
      balance: -estimatedTax // Simplificado (no estamos descontando retenciones previas para mantenerlo simple)
    };
  }
}
