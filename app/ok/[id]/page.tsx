'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OKOverview, Booking } from '@/lib/types'
import { ArrowLeft, Calendar, DollarSign, FileText, Building2 } from 'lucide-react'

export default function OKDetailPage() {
  const params = useParams()
  const okId = params.id as string
  const [okData, setOkData] = useState<OKOverview | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    return new Date(dateString).toLocaleDateString('de-CH')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade OK-Details...</p>
        </div>
      </div>
    )
  }

  if (error || !okData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Fehler</h3>
            <p className="text-red-600 mt-1">{error || 'OK nicht gefunden'}</p>
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Zurück</span>
            </a>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{okData.ok_nr}</h1>
              <p className="text-gray-600">{okData.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* OK Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Budget (SOLL)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(okData.budget_total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Verbraucht (IST)</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(okData.spent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Verfügbar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(okData.available)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Buchungen</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {okData.booking_count}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Konto Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Konto-Informationen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Konto-Nummer</p>
                <p className="text-lg font-semibold text-gray-900">{okData.konto_nr}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Konto-Name</p>
                <p className="text-lg font-semibold text-gray-900">{okData.account_name}</p>
              </div>
            </div>
          </div>

          {/* Buchungen */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Buchungen</h2>
            </div>
            
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Datum</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Beleg-Nr</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Text</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Gegenkonto</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">Betrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{formatDate(booking.booking_date)}</td>
                        <td className="px-4 py-2 font-mono text-sm">{booking.beleg_nr}</td>
                        <td className="px-4 py-2 max-w-xs truncate" title={booking.text_long || undefined}>
                          {booking.text_long}
                        </td>
                        <td className="px-4 py-2 font-mono text-sm">{booking.gegenkonto}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {formatCurrency(booking.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Keine Buchungen gefunden</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}