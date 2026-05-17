import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly resetTokenStorageKey = 'taxflow_reset_token';
  private http = inject(HttpClient);
  private apiUrl = 'https://le7uyeu46a.execute-api.us-east-1.amazonaws.com';

  constructor() { }

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, password });
  }

  register(userData: { correo: string; password: string; nombres: string; apellidos: string; ruc: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData);
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const generatedToken = `reset_${Date.now()}`;

    localStorage.setItem(this.resetTokenStorageKey, generatedToken);

    const user = localStorage.getItem('taxflow_user');
    const parsedUser = user ? JSON.parse(user) as { email?: string } : null;
    const hasRegisteredUser = parsedUser?.email?.toLowerCase() === normalizedEmail;

    const message = hasRegisteredUser
      ? 'Enviamos un enlace de recuperacion a tu correo.'
      : 'Si existe una cuenta con ese correo, recibiras instrucciones para restablecer tu contrasena.';

    return of({ message }).pipe(delay(600));
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    const savedToken = localStorage.getItem(this.resetTokenStorageKey);

    if (!savedToken || savedToken !== token) {
      return throwError(() => new Error('El enlace de recuperacion es invalido o expiro.'));
    }

    const user = localStorage.getItem('taxflow_user');

    if (user) {
      const parsedUser = JSON.parse(user) as Record<string, string>;
      parsedUser['password'] = newPassword;
      localStorage.setItem('taxflow_user', JSON.stringify(parsedUser));
    }

    localStorage.removeItem(this.resetTokenStorageKey);

    return of({ message: 'Tu contrasena se actualizo correctamente. Ya puedes iniciar sesion.' }).pipe(delay(600));
  }
}
