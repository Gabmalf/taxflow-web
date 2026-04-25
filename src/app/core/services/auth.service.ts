import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly resetTokenStorageKey = 'taxflow_reset_token';

  constructor() { }

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
