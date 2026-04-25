import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IncomeService } from '../../../core/services/income.service';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './income-form.component.html',
  styleUrl: './income-form.component.css'
})
export class IncomeFormComponent {
  incomeForm: FormGroup;
  private fb = inject(FormBuilder);
  private incomeService = inject(IncomeService);
  private router = inject(Router);

  constructor() {
    this.incomeForm = this.fb.group({
      type: ['Cuarta', Validators.required],
      date: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['Soles', Validators.required],
      description: ['', Validators.required],
      payerRuc: ['', [Validators.pattern(/^[0-9]{11}$/)]],
      hasRetention: [false]
    });
  }

  onSubmit() {
    if (this.incomeForm.valid) {
      this.incomeService.addIncome(this.incomeForm.value);
      this.router.navigate(['/incomes']);
    } else {
      this.incomeForm.markAllAsTouched();
    }
  }
}
