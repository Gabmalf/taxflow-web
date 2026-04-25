import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const passwordMatchValidator: ValidatorFn = (group): ValidationErrors | null => {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly token = this.route.snapshot.paramMap.get('token')
    ?? this.route.snapshot.queryParamMap.get('token')
    ?? '';

  readonly resetPasswordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.pattern(strongPasswordPattern)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  isSubmitting = false;
  successMessage = '';
  errorMessage = this.token ? '' : 'No se encontro un token valido en el enlace.';

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.errorMessage = 'No se encontro un token valido en el enlace.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { newPassword } = this.resetPasswordForm.getRawValue();

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message;
        this.resetPasswordForm.reset();
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message || 'No se pudo actualizar la contrasena.';
      }
    });
  }
}