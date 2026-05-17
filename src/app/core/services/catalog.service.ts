import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CatalogItem {
  id: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = 'https://le7uyeu46a.execute-api.us-east-1.amazonaws.com/catalogos';

  getMonedas(): Observable<CatalogItem[]> {
    return this.http.get<{status: string, data: CatalogItem[]}>(`${this.apiUrl}/monedas`)
      .pipe(map(res => res.data));
  }

  getTiposIngreso(): Observable<CatalogItem[]> {
    return this.http.get<{status: string, data: CatalogItem[]}>(`${this.apiUrl}/tipos-ingreso`)
      .pipe(map(res => res.data));
  }

  getCategoriasGasto(): Observable<CatalogItem[]> {
    return this.http.get<{status: string, data: CatalogItem[]}>(`${this.apiUrl}/categorias-gasto`)
      .pipe(map(res => res.data));
  }

  getTiposComprobante(): Observable<CatalogItem[]> {
    return this.http.get<{status: string, data: CatalogItem[]}>(`${this.apiUrl}/tipos-comprobante`)
      .pipe(map(res => res.data));
  }
}
