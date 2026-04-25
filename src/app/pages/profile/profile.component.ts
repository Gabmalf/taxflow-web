import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  user!: User;
  editMode = false;
  saveError = false;
  saveSuccess = false;

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    lastDigitRuc: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    rentType: ['Ambas', [Validators.required]],
    preferredCurrency: ['Soles', [Validators.required]]
  });

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.resetForm();
  }

  enterEditMode(): void {
    this.resetForm();
    this.editMode = true;
    this.saveError = false;
    this.saveSuccess = false;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.saveError = false;
    this.resetForm();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveError = true;
      return;
    }

    const updated: User = {
      ...this.user,
      ...this.form.value,
      lastDigitRuc: Number(this.form.value.lastDigitRuc)
    };
    this.userService.updateUser(updated);
    this.user = updated;
    this.editMode = false;
    this.saveError = false;
    this.saveSuccess = true;
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.invalid;
  }

  private resetForm(): void {
    this.form.reset({
      fullName: this.user.fullName,
      email: this.user.email,
      ruc: this.user.ruc,
      lastDigitRuc: String(this.user.lastDigitRuc),
      rentType: this.user.rentType,
      preferredCurrency: this.user.preferredCurrency
    });
  }
}
