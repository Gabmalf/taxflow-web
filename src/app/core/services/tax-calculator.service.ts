import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
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

  simulate(): Observable<TaxSimulationResult> {
    return forkJoin({
      incomes: this.incomeService.getIncomes(),
      expenses: this.expenseService.getExpenses()
    }).pipe(
      map(({ incomes, expenses }) => {
        let rentaBruta4ta = 0;
        let rentaBruta5ta = 0;
        let totalRetenciones = 0;

        incomes.forEach((i: any) => {
          // Convertir a soles (USD = PEN x 3.75 referencial para el simulador)
          const isUSD = i.currency === 'USD';
          const rate = isUSD ? 3.75 : 1;
          const amountPen = i.amount * rate;
          const retentionPen = (i.retentionAmount || 0) * rate;

          const tipo = i.type?.toLowerCase() || '';
          // De 4ta categoría: Honorarios, Dietas
          if (tipo.includes('honorario') || tipo.includes('dieta') || tipo.includes('cuarta') || tipo.includes('4ta')) {
            rentaBruta4ta += amountPen;
          } else {
            // Sueldo, Gratificaciones, Utilidades, etc.
            rentaBruta5ta += amountPen;
          }
          
          totalRetenciones += retentionPen;
        });

        // Deducción 20% solo para 4ta (máximo 24 UIT)
        const deduccion20 = Math.min(rentaBruta4ta * 0.2, 24 * this.UIT);
        const rentaNeta4ta = rentaBruta4ta - deduccion20;
        const totalRentas = rentaNeta4ta + rentaBruta5ta;

        // Gastos Deducibles sustentados (hasta 3 UIT)
        let totalExpensesDeducible = 0;
        expenses.forEach((e: any) => {
          totalExpensesDeducible += (e.deducibleAmount || 0);
        });
        const validDeduction = Math.min(totalExpensesDeducible, this.MAX_ADDITIONAL_DEDUCTION);

        // Deducción Legal Obligatoria de 7 UIT (solo si hay rentas)
        const deduccion7UIT = totalRentas > 0 ? Math.min(totalRentas, this.DEDUCTION_7_UIT) : 0;

        // Renta Neta Imponible
        let rentaNetaImponible = totalRentas - deduccion7UIT - validDeduction;
        if (rentaNetaImponible < 0) rentaNetaImponible = 0;

        // Cálculo de los Tramos de Impuesto a la Renta
        let estimatedTax = 0;
        let remaining = rentaNetaImponible;

        const tramos = [
          { max: 5 * this.UIT, rate: 0.08 },
          { max: 20 * this.UIT, rate: 0.14 },
          { max: 35 * this.UIT, rate: 0.17 },
          { max: 45 * this.UIT, rate: 0.20 },
          { max: Infinity, rate: 0.30 }
        ];

        let prevMax = 0;
        for (const tramo of tramos) {
          if (remaining <= 0) break;
          const limitInTramo = tramo.max - prevMax;
          const amountInTramo = Math.min(remaining, limitInTramo);
          estimatedTax += amountInTramo * tramo.rate;
          remaining -= amountInTramo;
          prevMax = tramo.max;
        }

        // Saldo Referencial (Retenciones aplicadas - Impuesto Estimado)
        const balance = totalRetenciones - estimatedTax;

        return {
          totalIncomes: rentaBruta4ta + rentaBruta5ta,
          totalExpenses: totalExpensesDeducible,
          netRent: totalRentas,
          deduction7UIT: deduccion7UIT,
          additionalDeduction: validDeduction,
          estimatedTax: estimatedTax,
          balance: balance
        };
      })
    );
  }
}
