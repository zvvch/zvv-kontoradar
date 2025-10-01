'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AccountOverview, OKOverview } from '@/lib/types'
import { 
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  AlertTriangle
} from 'lucide-react'

export default function AccountsPage() {
  const [accountOverviews, setAccountOverviews] = useState<AccountOverview[]>([])
  const [okOverviews, setOkOverviews] = useState<OKOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  useEffect(() => {
    fetchAccountOverviews()
    fetchOKOverviews()
  }, [])

  const fetchAccountOverviews = async () => {
    try {
      const { data, error } = await supabase
        .from('v_account_overview')
        .select('*')
        .order('konto_nr')

      if (error) throw error
      setAccountOverviews(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Account-Daten')
    }
  }

  const fetchOKOverviews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('v_ok_overview')
        .select('*')
        .order('ok_nr')

      if (error) throw error
      setOkOverviews(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der OK-Daten')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getAccountOKs = (accountId: string) => {
    return okOverviews.filter(ok => ok.account_id === accountId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Lade Konten...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-danger-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-danger-800">Fehler</h3>
            <p className="text-sm text-danger-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Konto-Übersicht</h1>
          <p className="text-gray-600 mt-1">
            Übersicht über alle Konten und deren Objektkredite
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {accountOverviews.length} Konten
          </div>
          <div className="text-sm text-gray-500">
            {okOverviews.length} Objektkredite
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Konten</p>
              <p className="text-2xl font-bold text-primary-600">
                {accountOverviews.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gesamtbudget</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(accountOverviews.reduce((sum, acc) => sum + acc.total_budget, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verbraucht</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatCurrency(accountOverviews.reduce((sum, acc) => sum + acc.total_spent, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verfügbar</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(accountOverviews.reduce((sum, acc) => sum + acc.total_available, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Konten</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Konto-Nr</th>
                <th className="table-header">Name</th>
                <th className="table-header">OKs</th>
                <th className="table-header">Gesamtbudget</th>
                <th className="table-header">Verbraucht</th>
                <th className="table-header">Verfügbar</th>
                <th className="table-header">Auslastung</th>
                <th className="table-header">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountOverviews.map((account) => {
                const utilization = (account.total_spent / account.total_budget) * 100
                const accountOKs = getAccountOKs(account.account_id)
                
                return (
                  <tr key={account.account_id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium text-primary-600">
                      {account.konto_nr}
                    </td>
                    <td className="table-cell">
                      <div className="max-w-xs truncate" title={account.account_name}>
                        {account.account_name}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      {account.ok_count}
                    </td>
                    <td className="table-cell font-medium">
                      {formatCurrency(account.total_budget)}
                    </td>
                    <td className="table-cell text-warning-600">
                      {formatCurrency(account.total_spent)}
                    </td>
                    <td className="table-cell font-medium text-success-600">
                      {formatCurrency(account.total_available)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilization > 80 ? 'bg-danger-500' : 
                              utilization > 60 ? 'bg-warning-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelectedAccount(
                          selectedAccount === account.account_id ? null : account.account_id
                        )}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {selectedAccount === account.account_id ? 'Verstecken' : 'OKs anzeigen'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account OKs Detail */}
      {selectedAccount && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Objektkredite für Konto {accountOverviews.find(acc => acc.account_id === selectedAccount)?.konto_nr}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">OK-Nr</th>
                  <th className="table-header">Titel</th>
                  <th className="table-header">Budget</th>
                  <th className="table-header">Verbraucht</th>
                  <th className="table-header">Verfügbar</th>
                  <th className="table-header">Buchungen</th>
                  <th className="table-header">Letzte Buchung</th>
                  <th className="table-header">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getAccountOKs(selectedAccount).map((ok) => {
                  const utilization = (ok.spent / ok.budget_total) * 100
                  return (
                    <tr key={ok.ok_id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium text-primary-600">
                        {ok.ok_nr}
                      </td>
                      <td className="table-cell">
                        <div className="max-w-xs truncate" title={ok.title}>
                          {ok.title}
                        </div>
                      </td>
                      <td className="table-cell font-medium">
                        {formatCurrency(ok.budget_total)}
                      </td>
                      <td className="table-cell text-warning-600">
                        {formatCurrency(ok.spent)}
                      </td>
                      <td className="table-cell font-medium text-success-600">
                        {formatCurrency(ok.available)}
                      </td>
                      <td className="table-cell text-center">
                        {ok.booking_count}
                      </td>
                      <td className="table-cell text-sm text-gray-500">
                        {ok.last_booking ? new Date(ok.last_booking).toLocaleDateString('de-CH') : '-'}
                      </td>
                      <td className="table-cell">
                        <a
                          href={`/ok/${ok.ok_id}`}
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
