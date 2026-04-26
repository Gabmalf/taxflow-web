import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Income } from '../../core/models/models';
import { IncomeService } from '../../core/services/income.service';

type IncomeTypeFilter = 'all' | Income['type'];
type IncomeCurrencyFilter = 'all' | Income['currency'];
type IncomeRetentionFilter = 'all' | 'with' | 'without';

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface PeriodOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css'
})
export class IncomesComponent implements OnInit {
  incomes: Income[] = [];
  filteredIncomes: Income[] = [];
  periodOptions: PeriodOption[] = [];

  searchTerm = '';
  selectedPeriod = 'all';
  selectedType: IncomeTypeFilter = 'all';
  selectedRetention: IncomeRetentionFilter = 'all';
  selectedCurrency: IncomeCurrencyFilter = 'all';

  readonly typeOptions: FilterOption<IncomeTypeFilter>[] = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'Cuarta', label: 'Cuarta categoría' },
    { value: 'Quinta', label: 'Quinta categoría' },
    { value: 'Otro', label: 'Otros ingresos' }
  ];
  readonly retentionOptions: FilterOption<IncomeRetentionFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'with', label: 'Con retención' },
    { value: 'without', label: 'Sin retención' }
  ];
  readonly currencyOptions: FilterOption<IncomeCurrencyFilter>[] = [
    { value: 'all', label: 'Todas' },
    { value: 'Soles', label: 'Soles (S/)' },
    { value: 'Dolares', label: 'Dólares ($)' }
  ];

  private readonly monthLabels = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];
  private incomeService = inject(IncomeService);

  ngOnInit() {
    this.loadIncomes();
  }

  loadIncomes() {
    this.incomes = this.incomeService
      .getIncomes()
      .sort((a, b) => this.compareByDateDesc(a, b));

    this.updatePeriodOptions();
    this.applyFilters();
  }

  deleteIncome(id: string) {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      this.incomeService.deleteIncome(id);
      this.loadIncomes();
    }
  }

  applyFilters() {
    const normalizedSearch = this.normalizeText(this.searchTerm.trim());

    this.filteredIncomes = this.incomes.filter((income) => {
      const matchesPeriod =
        this.selectedPeriod === 'all' || this.getPeriodValue(income.date) === this.selectedPeriod;
      const matchesType = this.selectedType === 'all' || income.type === this.selectedType;
      const matchesRetention =
        this.selectedRetention === 'all' ||
        (this.selectedRetention === 'with' && income.hasRetention) ||
        (this.selectedRetention === 'without' && !income.hasRetention);
      const matchesCurrency =
        this.selectedCurrency === 'all' || income.currency === this.selectedCurrency;
      const matchesSearch =
        !normalizedSearch ||
        [
          income.description,
          income.payerRuc ?? '',
          income.type,
          income.currency
        ].some((field) => this.normalizeText(field).includes(normalizedSearch));

      return matchesPeriod && matchesType && matchesRetention && matchesCurrency && matchesSearch;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedPeriod = 'all';
    this.selectedType = 'all';
    this.selectedRetention = 'all';
    this.selectedCurrency = 'all';
    this.applyFilters();
  }

  get hasActiveFilters() {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedPeriod !== 'all' ||
      this.selectedType !== 'all' ||
      this.selectedRetention !== 'all' ||
      this.selectedCurrency !== 'all'
    );
  }

  private updatePeriodOptions() {
    const uniquePeriods = Array.from(
      new Set(this.incomes.map((income) => this.getPeriodValue(income.date)).filter(Boolean))
    );

    this.periodOptions = uniquePeriods
      .sort((a, b) => b.localeCompare(a))
      .map((period) => ({
        value: period,
        label: this.formatPeriodLabel(period)
      }));

    if (
      this.selectedPeriod !== 'all' &&
      !this.periodOptions.some((period) => period.value === this.selectedPeriod)
    ) {
      this.selectedPeriod = 'all';
    }
  }

  private getPeriodValue(date: string) {
    return date.slice(0, 7);
  }

  private formatPeriodLabel(period: string) {
    const [year, month] = period.split('-');
    const monthLabel = this.monthLabels[Number(month) - 1];

    return monthLabel ? `${monthLabel} ${year}` : period;
  }

  private normalizeText(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private compareByDateDesc(a: Income, b: Income) {
    const dateComparison = b.date.localeCompare(a.date);

    return dateComparison !== 0 ? dateComparison : b.id.localeCompare(a.id);
  }
}
