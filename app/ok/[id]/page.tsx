'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OKOverview, Booking } from '@/lib/types'
import { BurnDownChartECharts } from '@/components/BurnDownChartECharts'
import { BookingsTreemap } from '@/components/BookingsTreemap'
import { ArrowLeft, DollarSign, Target, Building2, SortAsc, SortDesc } from 'lucide-react'

export default function OKDetailPage() {
  const params = useParams()
  const okId = params.id as string
  const [okData, setOkData] = useState<OKOverview | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingSortBy, setBookingSortBy] = useState<string>('booking_date')
  const [bookingSortOrder, setBookingSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedBurnDownYear, setSelectedBurnDownYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    if (okId) {
      fetchOKData()
    }
  }, [okId])

  const fetchOKData = async () => {
    try {
      setLoading(true)
      const [okResult, bookingsResult] = await Promise.all([
        supabase.from('v_ok_overview').select('*').eq('ok_id', okId).single(),
        supabase.from('booking').select('*').eq('ok_id', okId).order('booking_date', { ascending: false })
      ])

      if (okResult.error) throw okResult.error
      if (bookingsResult.error) throw bookingsResult.error

      setOkData(okResult.data)
      setBookings(bookingsResult.data || [])
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
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
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

  // Sortier-Funktion für Buchungen
  const handleBookingSort = (column: string) => {
    if (bookingSortBy === column) {
      setBookingSortOrder(bookingSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setBookingSortBy(column)
      setBookingSortOrder('desc')
    }
  }

  // Sortierte Buchungen
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      let aVal: any
      let bVal: any
      
      switch (bookingSortBy) {
        case 'booking_date':
          aVal = new Date(a.booking_date).getTime()
          bVal = new Date(b.booking_date).getTime()
          break
        case 'beleg_nr':
          aVal = a.beleg_nr || ''
          bVal = b.beleg_nr || ''
          break
        case 'text_long':
          aVal = (a.text_long || '').toLowerCase()
          bVal = (b.text_long || '').toLowerCase()
          break
        case 'amount':
          aVal = Math.abs(a.amount)
          bVal = Math.abs(b.amount)
          break
        default:
          aVal = new Date(a.booking_date).getTime()
          bVal = new Date(b.booking_date).getTime()
      }
      
      if (bookingSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [bookings, bookingSortBy, bookingSortOrder])

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

  // Berechne Burn-Down Daten für das OK (nur für ausgewähltes Jahr)
  const burnDownData = useMemo(() => {
    if (!bookings.length || !okData) return []

    // Filtere Buchungen nach ausgewähltem Jahr
    const yearBookings = bookings.filter(
      b => new Date(b.booking_date).getFullYear() === selectedBurnDownYear
    )

    if (yearBookings.length === 0) return []

    const sortedBookings = [...yearBookings].sort((a, b) => 
      new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
    )

    const firstDate = new Date(sortedBookings[0].booking_date)
    let cumulativeSpent = 0
    
    // Startpunkt: Voller Budget am ersten Buchungsdatum des Jahres
    const dataPoints = [{
      date: firstDate.toISOString().split('T')[0],
      budget: okData.budget_total,
      spent: 0,
      available: okData.budget_total,
      remaining: okData.budget_total,
      idealRemaining: okData.budget_total,
      percentage: 0
    }]
    
    // Füge jeden Buchungspunkt hinzu
    // Die ideale Linie ist linear über die Anzahl der Datenpunkte (nicht Zeit)
    const totalPoints = sortedBookings.length
    sortedBookings.forEach((booking, index) => {
      cumulativeSpent += Math.abs(booking.amount)
      const remaining = Math.max(0, okData.budget_total - cumulativeSpent)
      
      // Ideale Linie: Linear über die Anzahl der Datenpunkte
      const progress = (index + 1) / totalPoints
      const idealRemaining = Math.max(0, okData.budget_total * (1 - progress))
      
      dataPoints.push({
        date: booking.booking_date,
        budget: okData.budget_total,
        spent: cumulativeSpent,
        available: remaining,
        remaining: remaining,
        idealRemaining: idealRemaining,
        percentage: (cumulativeSpent / okData.budget_total) * 100
      })
    })
    
    return dataPoints
  }, [bookings, okData, selectedBurnDownYear])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Lade OK-Details...</p>
        </div>
      </div>
    )
  }

  if (error || !okData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Fehler</h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error || 'OK nicht gefunden'}</p>
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

  const utilization = getUtilizationPercentage(okData.available, okData.budget_total)

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">OK {okData.ok_nr}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{okData.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* OK Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-600">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Budget</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(okData.budget_total)}
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
                    {formatCurrency(Math.abs(okData.spent))}
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
                    {formatCurrency(okData.available)}
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
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Auslastung</p>
                  <p className={`text-lg sm:text-2xl font-bold ${getUtilizationColor(okData.available, okData.budget_total)}`}>
                    {utilization.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Konto Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gray-600">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Konto-Informationen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Konto-Nummer</p>
                <a 
                  href={`/konto/${okData.konto_nr}`}
                  className="text-base sm:text-lg font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                >
                  {okData.konto_nr}
                </a>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Konto-Name</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{okData.account_name}</p>
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
                    okNumber={okData.ok_nr}
                    title={okData.title}
                    totalBudget={okData.budget_total}
                    currentSpent={Math.abs(okData.spent)}
                    currentAvailable={okData.available}
                  />
                </div>
              </div>

              {/* Treemap - Buchungen nach Größe */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Buchungen nach Größe
                </h4>
                <div className="h-64 sm:h-80 md:h-96">
                  <BookingsTreemap
                    bookings={bookings}
                    okNumber={okData.ok_nr}
                    title={okData.title}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buchungen Tabelle */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-600">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Buchungen</h2>
              </div>
            </div>
            
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleBookingSort('booking_date')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-white">Datum</span>
                          {bookingSortBy === 'booking_date' && (
                            bookingSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleBookingSort('beleg_nr')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="group-hover:text-white">Beleg-Nr</span>
                          {bookingSortBy === 'beleg_nr' && (
                            bookingSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleBookingSort('text_long')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-white">Text</span>
                          {bookingSortBy === 'text_long' && (
                            bookingSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-primary-600 hover:text-white transition-colors group"
                        onClick={() => handleBookingSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span className="group-hover:text-white">Betrag</span>
                          {bookingSortBy === 'amount' && (
                            bookingSortOrder === 'asc' ? 
                              <SortAsc className="h-3.5 w-3.5" /> : 
                              <SortDesc className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{formatDate(booking.booking_date)}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{booking.beleg_nr}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white max-w-xs truncate" title={booking.text_long || undefined}>
                          {booking.text_long}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                          {formatCurrency(booking.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Keine Buchungen gefunden</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}