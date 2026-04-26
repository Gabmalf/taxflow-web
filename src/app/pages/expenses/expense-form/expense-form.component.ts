import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css'
})
export class ExpenseFormComponent {
  expenseForm: FormGroup;
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private router = inject(Router);

  categories = [
    'Restaurantes y hoteles',
    'Servicios médicos',
    'Servicios odontológicos',
    'Alquiler de inmueble',
    'Servicios profesionales',
    'Aportes a EsSalud de trabajadores del hogar',
    'Otros gastos deducibles'
  ];

  private readonly allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  selectedFileName: string | null = null;
  fileError: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.fileError = null;
    this.selectedFileName = null;

    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!this.allowedExtensions.includes(extension)) {
      this.fileError = 'Solo se permiten archivos PDF, JPG o PNG.';
      input.value = '';
      return;
    }

    this.selectedFileName = file.name;
  }

  constructor() {
    this.expenseForm = this.fb.group({
      category: ['', Validators.required],
      date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['Soles', Validators.required],
      description: ['', Validators.required],
      providerRuc: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      receiptType: ['Factura Electrónica', Validators.required]
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      this.expenseService.addExpense(this.expenseForm.value);
      this.router.navigate(['/expenses']);
    } else {
      this.expenseForm.markAllAsTouched();
    }
  }
}
