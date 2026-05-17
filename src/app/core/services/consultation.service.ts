import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private http = inject(HttpClient);
  private apiUrl = 'https://le7uyeu46a.execute-api.us-east-1.amazonaws.com/consultas';

  submitConsultation(data: { asunto: string; categoria: string; mensaje: string }): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(this.apiUrl, data).pipe(
      map(res => res)
    );
  }
}
