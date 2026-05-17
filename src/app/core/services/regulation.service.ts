import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegulationService {
  private http = inject(HttpClient);
  private apiUrl = 'https://le7uyeu46a.execute-api.us-east-1.amazonaws.com/normativas';

  getRegulations(): Observable<any[]> {
    return this.http.get<{status: string, data: any[]}>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }
}
