import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = false;
  errorMessage = '';

  captchaNum1 = 0;
  captchaNum2 = 0;

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      ruc: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      captcha: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
    this.generateCaptcha();
  }

  generateCaptcha() {
    this.captchaNum1 = Math.floor(Math.random() * 10) + 1;
    this.captchaNum2 = Math.floor(Math.random() * 10) + 1;
    this.registerForm.get('captcha')?.setValue('');
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValues = this.registerForm.value;

      if (Number(formValues.captcha) !== (this.captchaNum1 + this.captchaNum2)) {
        this.errorMessage = 'Respuesta de seguridad incorrecta.';
        this.generateCaptcha();
        this.isLoading = false;
        return;
      }
      
      // Separamos nombre y apellido por espacio de manera simple
      const names = formValues.fullName.trim().split(' ');
      const nombres = names[0] || '';
      const apellidos = names.slice(1).join(' ') || '';

      const userData = {
        correo: formValues.email,
        password: formValues.password,
        nombres: nombres,
        apellidos: apellidos,
        ruc: formValues.ruc
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success' && response.data) {
            localStorage.setItem('taxflow_user', JSON.stringify({
              usuario_id: response.data.usuario_id,
              email: response.data.correo,
              nombres: response.data.nombres,
              apellidos: response.data.apellidos,
              ruc: response.data.ruc,
              token: response.data.token
            }));
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Hubo un error al registrar el usuario.';
            this.generateCaptcha();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.generateCaptcha();
          this.errorMessage = err.error?.message || 'Error de conexión con el servidor. Verifica que tu nueva API Lambda de registro esté desplegada y configurada correctamente en CORS.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
