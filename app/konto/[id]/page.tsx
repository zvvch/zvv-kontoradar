'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OKOverview, Booking } from '@/lib/types'
import { BurnDownChartECharts } from '@/components/BurnDownChartECharts'
import { OKsTreemap } from '@/components/OKsTreemap'
import { ArrowLeft, DollarSign, FileText, Building2, Target, SortAsc, SortDesc } from 'lucide-react'

export default function KontoDetailPage() {
  const params = useParams()
  const kontoId = params.id as string
  const [kontoData, setKontoData] = useState<{
    konto_nr: string
    account_name: string
    total_budget: number
    total_spent: number
    total_available: number
    ok_count: number
  } | null>(null)
  const [oks, setOks] = useState<OKOverview[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [okSortBy, setOkSortBy] = useState<string>('first_booking')
  const [okSortOrder, setOkSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedBurnDownYear, setSelectedBurnDownYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    if (kontoId) {
      fetchKontoData()
    }
  }, [kontoId])

  const fetchKontoData = async () => {
    try {
      setLoading(true)
      
      // Hole alle OKs für dieses Konto
      const { data: oksData, error: oksError } = await supabase
        .from('v_ok_overview')
        .select('*')
        .eq('konto_nr', kontoId)
        .order('ok_nr', { ascending: true })

      if (oksError) throw oksError

      setOks(oksData || [])

      // Hole alle Buchungen für dieses Konto
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking')
        .select('*')
        .eq('konto_nr', kontoId)
        .order('booking_date', { ascending: true })

      if (bookingsError) throw bookingsError

      setBookings(bookingsData || [])

      // Aggregiere Konto-Daten aus den OKs
      if (oksData && oksData.length > 0) {
        const totalBudget = oksData.reduce((sum: number, ok: OKOverview) => sum + (ok.budget_total || 0), 0)
        const totalSpent = oksData.reduce((sum: number, ok: OKOverview) => sum + Math.abs(ok.spent || 0), 0)
        const totalAvailable = oksData.reduce((sum: number, ok: OKOverview) => sum + (ok.available || 0), 0)

        setKontoData({
          konto_nr: oksData[0].konto_nr,
          account_name: oksData[0].account_name,
          total_budget: totalBudget,
          total_spent: totalSpent,
          total_available: totalAvailable,
          ok_count: oksData.length
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Konto-Daten')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getUtilizationColor = (available: number, budget: number) => {
    if (budget === 0) return 'text-gray-500'
    const percentage = ((budget - available) / budget) * 100
    if (percentage < 75) return 'text-green-600 dark:text-green-400'
    if (percentage < 90) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getUtilizationPercentage = (available: number, budget: number) => {
    if (budget === 0) return 0
    return ((budget - available) / budget) * 100
  }

  // Sortier-Funktion für OKs
  const handleOkSort = (column: string) => {
    if (okSortBy === column) {
      setOkSortOrder(okSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setOkSortBy(column)
      setOkSortOrder('asc')
    }
  }

  // Sortierte OKs
  const sortedOks = useMemo(() => {
    return [...oks].sort((a, b) => {
      let aVal: any
      let bVal: any
      
      switch (okSortBy) {
        case 'first_booking':
          aVal = a.first_booking ? new Date(a.first_booking).getTime() : 0
          bVal = b.first_booking ? new Date(b.first_booking).getTime() : 0
          break
        case 'title':
          aVal = (a.title || '').toLowerCase()
          bVal = (b.title || '').toLowerCase()
          break
        case 'ok_nr':
          aVal = a.ok_nr || ''
          bVal = b.ok_nr || ''
          break
        case 'budget_total':
          aVal = a.budget_total || 0
          bVal = b.budget_total || 0
          break
        case 'spent':
          aVal = Math.abs(a.spent || 0)
          bVal = Math.abs(b.spent || 0)
          break
        case 'available':
          aVal = a.available || 0
          bVal = b.available || 0
          break
        case 'utilization':
          aVal = getUtilizationPercentage(a.available, a.budget_total)
          bVal = getUtilizationPercentage(b.available, b.budget_total)
          break
        default:
          aVal = a.ok_nr || ''
          bVal = b.ok_nr || ''
      }
      
      if (okSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [oks, okSortBy, okSortOrder])

  // Ermittle verfügbare Jahre aus Buchungen
  const availableYears = useMemo(() => {
    if (!bookings.length) return []
    const years = Array.from(new Set(bookings.map(b => new Date(b.booking_date).getFullYear())))
    return years.sort((a, b) => b - a)
  }, [bookings])

  // Stelle sicher, dass das ausgewählte Jahr verfügbar ist
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedBurnDownYear)) {
      setSelectedBurnDownYear(availableYears[0])
    }
  }, [availableYears, selectedBurnDownYear])

  // Berechne Burn-Down Daten für das Konto (nur für ausgewähltes Jahr)
  const burnDownData = useMemo(() => {
    if (!bookings.length || !kontoData) return []

    // Filtere Buchungen nach ausgewähltem Jahr
    const yearBookings = bookings.filter(
      b => new Date(b.booking_date).getFullYear() === selectedBurnDownYear
    )

    if (yearBookings.length === 0) return []

    const sortedBookings = [...yearBookings].sort((a, b) => 
      new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
    )

    const monthlyData: Record<string, { spent: number, date: Date }> = {}
    
    sortedBookings.forEach(booking => {
      const date = new Date(booking.booking_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { spent: 0, date }
      }
      monthlyData[monthKey].spent += Math.abs(booking.amount)
    })

    const months = Object.keys(monthlyData).sort()
    let cumulativeSpent = 0
    
    // Startpunkt: Voller Budget am Anfang des Jahres
    const dataPoints = [{
      date: new Date(sortedBookings[0].booking_date).toISOString(),
      budget: kontoData.total_budget,
      spent: 0,
      available: kontoData.total_budget,
      remaining: kontoData.total_budget,
      idealRemaining: kontoData.total_budget,
      percentage: 0
    }]
    
    // Weitere Datenpunkte (linear über Anzahl Monate)
    months.forEach((monthKey, index) => {
      cumulativeSpent += monthlyData[monthKey].spent
      const remaining = Math.max(0, kontoData.total_budget - cumulativeSpent)
      const idealRemaining = Math.max(0, kontoData.total_budget - (kontoData.total_budget / months.length) * (index + 1))
      
      dataPoints.push({
        date: monthlyData[monthKey].date.toISOString(),
        budget: kontoData.total_budget,
        spent: cumulativeSpent,
        available: remaining,
        remaining: remaining,
        idealRemaining: idealRemaining,
        percentage: (cumulativeSpent / kontoData.total_budget) * 100
      })
    })
    
    return dataPoints
  }, [bookings, kontoData, selectedBurnDownYear])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Lade Konto-Details...</p>
        </div>
      </div>
    )
  }

  if (error || !kontoData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Fehler</h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error || 'Konto nicht gefunden'}</p>
            <a 
              href="/" 
              className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zum Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück</span>
            </a>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Konto {kontoData.konto_nr}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{kontoData.account_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Konto Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-600">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Gesamtbudget</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(kontoData.total_budget)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-600">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Verbraucht</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(kontoData.total_spent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-600">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Verfügbar</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(kontoData.total_available)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-600">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Anzahl OKs</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {kontoData.ok_count}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts - Burn-Down and Treemap */}
          {burnDownData.length > 0 && bookings.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Burn-Down Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Burn-Down Chart
                  </h4>
                  {availableYears.length > 1 && (
                    <select 
                      value={selectedBurnDownYear}
                      onChange={(e) => setSelectedBurnDownYear(Number(e.target.value))}
                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="h-64 sm:h-80 md:h-96">
                  <BurnDownChartECharts
                    data={burnDownData}
                    okNumber={kontoData.konto_nr}
                    title={kontoData.account_name}
                    totalBudget={kontoData.total_budget}
                    currentSpent={kontoData.total_spent}
                    currentAvailable={kontoData.total_available}
                  />
                </div>
              </div>

              {/* Treemap - OKs nach Verbrauch */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  OKs nach Verbrauch
                </h4>
                <div className="h-64 sm:h-80 md:h-96">
                  <OKsTreemap
                    oks={oks}
                    title="Konto OKs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OKs Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-600">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Objektkredite (OKs)</h2>
              </div>
            </div>
            
            {oks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('first_booking')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-white">Datum</span>
                          {okSortBy === 'first_booking' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-white">Titel</span>
                          {okSortBy === 'title' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('ok_nr')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="group-hover:text-white">OK-Nr</span>
                          {okSortBy === 'ok_nr' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('budget_total')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span className="group-hover:text-white">Budget</span>
                          {okSortBy === 'budget_total' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('spent')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span className="group-hover:text-white">Verbraucht</span>
                          {okSortBy === 'spent' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('available')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span className="group-hover:text-white">Verfügbar</span>
                          {okSortBy === 'available' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleOkSort('utilization')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="group-hover:text-white">Auslastung</span>
                          {okSortBy === 'utilization' && (
                            okSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOks.map((ok) => {
                      const utilization = getUtilizationPercentage(ok.available, ok.budget_total)
                      return (
                        <tr 
                          key={ok.ok_id} 
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/ok/${ok.ok_id}`}
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {formatDate(ok.first_booking)}
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            <div className="max-w-xs truncate" title={ok.title}>
                              {ok.title}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-primary-600 dark:text-primary-400 font-medium">
                              {ok.ok_nr}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                            {formatCurrency(ok.budget_total)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                            {formatCurrency(Math.abs(ok.spent))}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                            {formatCurrency(ok.available)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${getUtilizationColor(ok.available, ok.budget_total)}`}>
                              {utilization.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Keine OKs gefunden</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

