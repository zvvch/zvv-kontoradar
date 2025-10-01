// Type definitions for the ZVV Kreditorenworkflow Dashboard

export interface Account {
  id: string
  konto_nr: string
  name: string
  currency: string
  created_at: string
  updated_at: string
}

export interface ObjectCredit {
  id: string
  ok_nr: string
  account_id: string
  title: string
  budget_total: number
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  ok_id: string
  account_id: string
  import_batch_id: string | null
  booking_date: string
  beleg_nr: string | null
  text_long: string | null
  gegenkonto: string | null
  amount: number
  currency: string
  created_at: string
  updated_at: string
}

export interface OKOverview {
  ok_id: string
  ok_nr: string
  title: string
  budget_total: number
  spent: number
  available: number
  booking_count: number
  first_booking: string | null
  last_booking: string | null
  account_id: string
  konto_nr: string
  account_name: string
}

export interface AccountOverview {
  account_id: string
  konto_nr: string
  account_name: string
  ok_count: number
  total_budget: number
  total_spent: number
  total_available: number
}

// Utility types for UI
export type BudgetStatus = 'healthy' | 'warning' | 'critical'

export interface BudgetStatusInfo {
  status: BudgetStatus
  percentage: number
  color: string
  bgColor: string
}

export function getBudgetStatus(available: number, budget: number): BudgetStatusInfo {
  const percentage = (available / budget) * 100
  
  if (percentage > 50) {
    return {
      status: 'healthy',
      percentage,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  } else if (percentage > 20) {
    return {
      status: 'warning',
      percentage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  } else {
    return {
      status: 'critical',
      percentage,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  }
}
