import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expense } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = 'https://le7uyeu46a.execute-api.us-east-1.amazonaws.com/gastos';

  getExpenses(): Observable<Expense[]> {
    return this.http.get<{status: string, data: any[]}>(this.apiUrl).pipe(
      map(res => res.data.map(d => ({
        id: d.id.toString(),
        category: d.categoria,
        date: d.fecha_gasto,
        amount: d.monto_total,
        deducibleAmount: d.monto_deducible || 0,
        currency: 'Soles', // Mapping for UI
        description: '', // g.descripcion no existe en DB, pero lo mapeamos para no romper UI
        providerRuc: '',
        receiptType: ''
      })))
    );
  }

  addExpense(expense: any): Observable<any> {
    const categoryMap: Record<string, number> = {
      'Restaurantes y hoteles': 1,
      'Servicios médicos': 2,
      'Servicios odontológicos': 3,
      'Alquiler de inmueble': 4,
      'Servicios profesionales': 5,
      'Aportes a EsSalud de trabajadores del hogar': 6,
      'Otros gastos deducibles': 7
    };
    
    const deductionMap: Record<string, number> = {
      'Restaurantes y hoteles': 0.15,
      'Servicios médicos': 0.30,
      'Servicios odontológicos': 0.30,
      'Alquiler de inmueble': 0.30,
      'Servicios profesionales': 0.30,
      'Aportes a EsSalud de trabajadores del hogar': 1.00,
      'Otros gastos deducibles': 0.30
    };
    
    const deductionFactor = deductionMap[expense.category] || 0.30;
    
    const payload = {
      categoria_gasto_id: categoryMap[expense.category] || 1,
      monto_total: expense.amount,
      monto_deducible: expense.amount * deductionFactor,
      fecha_gasto: expense.date
    };
    return this.http.post(this.apiUrl, payload);
  }

  deleteExpense(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, { action: 'delete' });
  }
}
