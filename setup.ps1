$components = @(
  "layouts/public-layout",
  "layouts/private-layout",
  "shared/components/sidebar",
  "shared/components/topbar",
  "shared/components/footer",
  "shared/components/summary-card",
  "shared/components/alert-message",
  "shared/components/modal",
  "shared/components/loading",
  "shared/components/breadcrumb",
  "shared/components/notification-bell",
  "shared/components/empty-state",
  "shared/components/confirm-dialog",
  "pages/auth/login",
  "pages/auth/register",
  "pages/auth/forgot-password",
  "pages/landing",
  "pages/dashboard",
  "pages/incomes",
  "pages/incomes/income-form",
  "pages/incomes/income-table",
  "pages/expenses",
  "pages/expenses/expense-form",
  "pages/expenses/expense-table",
  "pages/expenses/receipt-upload",
  "pages/tax-simulator",
  "pages/tax-calendar",
  "pages/regulations",
  "pages/regulations/regulation-detail",
  "pages/declaration-guide",
  "pages/notifications",
  "pages/reports",
  "pages/help-center",
  "pages/profile",
  "pages/accessibility",
  "pages/not-found"
)

foreach ($c in $components) {
  npx ng g c $c --skip-tests
}

$services = @(
  "core/services/auth",
  "core/services/user",
  "core/services/income",
  "core/services/expense",
  "core/services/tax-calculator",
  "core/services/regulation",
  "core/services/calendar",
  "core/services/notification",
  "core/services/report",
  "core/services/accessibility",
  "core/services/storage"
)

foreach ($s in $services) {
  npx ng g s $s --skip-tests
}
