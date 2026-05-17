import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  errorMessage = '';
  isLoading = false;

  captchaNum1 = 0;
  captchaNum2 = 0;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      captcha: ['', Validators.required]
    });
    this.generateCaptcha();
  }

  generateCaptcha() {
    this.captchaNum1 = Math.floor(Math.random() * 10) + 1;
    this.captchaNum2 = Math.floor(Math.random() * 10) + 1;
    this.loginForm.get('captcha')?.setValue('');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password, captcha } = this.loginForm.value;

      if (Number(captcha) !== (this.captchaNum1 + this.captchaNum2)) {
        this.errorMessage = 'Respuesta de seguridad incorrecta.';
        this.generateCaptcha();
        this.isLoading = false;
        return;
      }
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success') {
            // Guardamos el token y datos del usuario devueltos por AWS Lambda
            localStorage.setItem('taxflow_user', JSON.stringify(response.data));
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Error al iniciar sesión';
            this.generateCaptcha();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.generateCaptcha();
          if (err.error && err.error.message) {
             this.errorMessage = err.error.message;
          } else if (err.error && err.error.error && err.error.error.message) {
             this.errorMessage = err.error.error.message;
          } else {
             this.errorMessage = 'Ocurrió un error al conectar con el servidor';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
