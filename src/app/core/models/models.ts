export interface User {
  id: string;
  fullName: string;
  preferredName?: string;
  email: string;
  ruc: string;
  lastDigitRuc: number;
  rentType: 'Cuarta' | 'Quinta' | 'Ambas';
  preferredCurrency: 'Soles' | 'Dolares';
}

export interface Income {
  id: string;
  type: 'Cuarta' | 'Quinta' | 'Otro';
  date: string;
  amount: number;
  currency: 'Soles' | 'Dolares';
  description: string;
  payerRuc?: string;
  hasRetention: boolean;
  receiptUrl?: string;
}

export interface Expense {
  id: string;
  category: string;
  date: string;
  amount: number;
  currency: 'Soles' | 'Dolares';
  description: string;
  providerRuc: string;
  receiptType: string;
  receiptUrl?: string;
}

export interface Regulation {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedAt: string;
  content: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Vencimiento' | 'Normativa' | 'Comprobante' | 'Alerta';
  isRead: boolean;
  date: string;
}

export interface TaxSimulationResult {
  totalIncomes: number;
  totalExpenses: number;
  netRent: number;
  deduction7UIT: number;
  additionalDeduction: number;
  estimatedTax: number;
  balance: number;
}

export interface Deadline {
  id: string;
  month: number;
  year: number;
  lastDigit: number;
  deadlineDate: string;
  status: 'Pendiente' | 'Proximo' | 'Vencido' | 'Cumplido';
}

export interface ReportSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  estimatedTax: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'Abierto' | 'Cerrado';
  date: string;
}
