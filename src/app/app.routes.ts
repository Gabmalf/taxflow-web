import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './layouts/private-layout/private-layout.component';

// Public pages
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LandingComponent } from './pages/landing/landing.component';

// Private pages
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IncomesComponent } from './pages/incomes/incomes.component';
import { IncomeFormComponent } from './pages/incomes/income-form/income-form.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { ExpenseFormComponent } from './pages/expenses/expense-form/expense-form.component';
import { TaxSimulatorComponent } from './pages/tax-simulator/tax-simulator.component';
import { TaxCalendarComponent } from './pages/tax-calendar/tax-calendar.component';
import { RegulationsComponent } from './pages/regulations/regulations.component';
import { DeclarationGuideComponent } from './pages/declaration-guide/declaration-guide.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { HelpCenterComponent } from './pages/help-center/help-center.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AccessibilityComponent } from './pages/accessibility/accessibility.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'landing', pathMatch: 'full' },
      { path: 'landing', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
    ]
  },
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'incomes', component: IncomesComponent },
      { path: 'incomes/new', component: IncomeFormComponent },
      { path: 'incomes/edit/:id', component: IncomeFormComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'expenses/new', component: ExpenseFormComponent },
      { path: 'expenses/edit/:id', component: ExpenseFormComponent },
      { path: 'tax-simulator', component: TaxSimulatorComponent },
      { path: 'tax-calendar', component: TaxCalendarComponent },
      { path: 'regulations', component: RegulationsComponent },
      { path: 'declaration-guide', component: DeclarationGuideComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'help-center', component: HelpCenterComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: AccessibilityComponent },
    ]
  },
  { path: '**', component: NotFoundComponent }
];
