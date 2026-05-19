import { HttpInterceptorFn, HttpResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // Log request
  console.group(`🌐 [HTTP REQUEST] ${req.method} ${req.url}`);
  if (req.body) {
    console.log('📤 Request Body (JSON Generado):', JSON.stringify(req.body, null, 2));
  }
  console.groupEnd();

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.group(`✅ [HTTP RESPONSE] ${req.method} ${req.url} - Status: ${event.status}`);
          console.log('📥 Response Body (JSON Recibido):', JSON.stringify(event.body, null, 2));
          console.groupEnd();
        }
      },
      error: (error) => {
        console.group(`❌ [HTTP ERROR] ${req.method} ${req.url}`);
        console.error('Detalles del error:', error);
        console.groupEnd();
      }
    })
  );
};
