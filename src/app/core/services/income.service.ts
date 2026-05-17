import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Income } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private apiUrl = 'https://le7uyeu46a.execute-api.us-east-1.amazonaws.com/ingresos';

  getIncomes(): Observable<Income[]> {
    return this.http.get<{ status: string, data: any[] }>(this.apiUrl).pipe(
      map(res => res.data.map(d => ({
        id: d.id.toString(),
        type: (d.tipo_ingreso || '').includes('Cuarta') ? 'Cuarta' : ((d.tipo_ingreso || '').includes('Quinta') ? 'Quinta' : 'Otro'),
        date: d.fecha_ingreso,
        amount: d.monto,
        currency: d.moneda_codigo === 'USD' ? 'Dolares' : 'Soles',
        description: d.descripcion,
        hasRetention: d.retencion_aplicada > 0,
        retentionAmount: d.retencion_aplicada || 0
      })))
    );
  }

  addIncome(income: any): Observable<any> {
    const payload = {
      tipo_ingreso_id: income.type === 'Cuarta' ? 1 : (income.type === 'Quinta' ? 2 : 3),
      moneda_id: income.currency === 'Soles' ? 1 : 2,
      monto: income.amount,
      fecha_ingreso: income.date,
      descripcion: income.description,
      retencion_aplicada: income.hasRetention ? (income.amount * 0.08) : 0
    };
    return this.http.post(this.apiUrl, payload);
  }

  deleteIncome(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, { action: 'delete' });
  }
}
