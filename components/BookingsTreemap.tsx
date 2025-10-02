'use client'

import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Layers } from 'lucide-react'
import { Booking } from '@/lib/types'

interface BookingsTreemapProps {
  bookings: Booking[]
  okNumber: string
  title: string
  onBookingHover?: (bookingId: number | null) => void
}

export function BookingsTreemap({ bookings, okNumber, title, onBookingHover }: BookingsTreemapProps) {
  
  const chartOption = useMemo(() => {
    if (!bookings || bookings.length === 0) return null

    // Gruppiere Buchungen nach Monat
    const bookingsByMonth = bookings.reduce((acc, booking) => {
      const date = new Date(booking.booking_date)
      const monthKey = date.toLocaleDateString('de-CH', { year: 'numeric', month: 'short' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(booking)
      return acc
    }, {} as Record<string, Booking[]>)

    // Berechne Gesamtsumme für Prozent-Berechnung
    const totalAmount = bookings.reduce((sum, b) => sum + Math.abs(b.amount), 0)

    // Gut gemischte Farbpalette für maximale Unterscheidbarkeit
    const colors = [
      '#3b82f6', // Blau
      '#ef4444', // Rot
      '#10b981', // Grün
      '#f59e0b', // Orange
      '#8b5cf6', // Lila
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Dunkelorange
      '#6366f1', // Indigo
      '#14b8a6', // Teal
      '#d946ef', // Fuchsia
      '#fb923c', // Hell-Orange
      '#22d3ee', // Hell-Cyan
      '#a78bfa', // Hell-Lila
      '#34d399', // Hell-Grün
      '#fbbf24', // Gelb
      '#f472b6', // Hell-Pink
      '#60a5fa', // Hell-Blau
      '#f87171', // Hell-Rot
      '#a3e635', // Hell-Lime
      '#818cf8', // Hell-Indigo
      '#2dd4bf', // Hell-Teal
      '#e879f9', // Hell-Fuchsia
      '#2563eb', // Mittel-Blau
      '#dc2626', // Mittel-Rot
      '#059669', // Mittel-Grün
      '#d97706', // Amber
      '#7c3aed', // Mittel-Lila
      '#db2777', // Mittel-Pink
      '#0891b2', // Mittel-Cyan
      '#65a30d', // Mittel-Lime
      '#ea580c', // Dunkel-Orange
      '#4f46e5', // Mittel-Indigo
      '#0d9488', // Mittel-Teal
      '#c026d3', // Mittel-Fuchsia
      '#1d4ed8', // Dunkel-Blau
      '#b91c1c', // Dunkel-Rot
      '#047857', // Dunkel-Grün
      '#b45309', // Dunkel-Amber
      '#6d28d9', // Dunkel-Lila
      '#be185d', // Dunkel-Pink
      '#0e7490', // Dunkel-Cyan
      '#4d7c0f', // Dunkel-Lime
      '#4338ca', // Dunkel-Indigo
      '#0f766e', // Dunkel-Teal
      '#a21caf', // Dunkel-Fuchsia
      '#0ea5e9', // Sky
      '#f43f5e', // Rose
      '#38bdf8', // Hell-Sky
      '#fb7185', // Hell-Rose
      '#0284c7', // Mittel-Sky
      '#e11d48', // Mittel-Rose
      '#0369a1', // Dunkel-Sky
      '#be123c', // Dunkel-Rose
      '#1e40af', // Navy
      '#991b1b', // Dunkel-Dunkel-Rot
      '#065f46', // Dunkel-Dunkel-Grün
      '#92400e', // Dunkel-Dunkel-Amber
      '#5b21b6', // Dunkel-Dunkel-Lila
      '#9f1239', // Dunkel-Dunkel-Pink
      '#155e75', // Dunkel-Dunkel-Cyan
      '#3f6212', // Dunkel-Dunkel-Lime
      '#3730a3', // Dunkel-Dunkel-Indigo
      '#115e59', // Dunkel-Dunkel-Teal
      '#86198f', // Dunkel-Dunkel-Fuchsia
      '#075985'  // Dunkel-Dunkel-Sky
    ]

    // Erstelle Treemap-Daten mit globalem Farbindex
    let globalColorIndex = 0
    const treemapData = Object.entries(bookingsByMonth).map(([month, monthBookings]) => {
      const monthTotal = monthBookings.reduce((sum, b) => sum + Math.abs(b.amount), 0)
      
      return {
        name: month,
        value: monthTotal,
        children: monthBookings.map((booking) => {
          const percentage = (Math.abs(booking.amount) / totalAmount) * 100
          const colorIndex = globalColorIndex++
          return {
            name: booking.text_long || 'Keine Beschreibung',
            value: Math.abs(booking.amount),
            bookingId: booking.id,
            itemStyle: {
              color: colors[colorIndex % colors.length]
            },
            label: {
              show: true,
              formatter: percentage >= 3 ? `${percentage.toFixed(1)}%` : '',
              fontSize: percentage >= 5 ? 14 : 11,
              fontWeight: 'bold',
              color: '#fff',
              overflow: 'truncate'
            },
            tooltip: {
              formatter: () => {
                const amount = new Intl.NumberFormat('de-CH', {
                  style: 'currency',
                  currency: 'CHF',
                  minimumFractionDigits: 2,
                }).format(booking.amount)
                const date = new Date(booking.booking_date).toLocaleDateString('de-CH')
                return `
                  <strong>${booking.text_long}</strong><br/>
                  Datum: ${date}<br/>
                  Beleg: ${booking.beleg_nr}<br/>
                  Gegenkonto: ${booking.gegenkonto}<br/>
                  Betrag: ${amount}<br/>
                  Anteil: ${percentage.toFixed(2)}%
                `
              }
            }
          }
        })
      }
    })

    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: any) => {
          if (params.treePathInfo && params.treePathInfo.length > 1) {
            // Einzelbuchung - Zeige alle Details im Tooltip
            return params.data.tooltip?.formatter() || ''
          } else {
            // Monat
            const amount = new Intl.NumberFormat('de-CH', {
              style: 'currency',
              currency: 'CHF',
              minimumFractionDigits: 0,
            }).format(params.value)
            const count = params.data.children?.length || 0
            return `<strong>${params.name}</strong><br/>Buchungen: ${count}<br/>Total: ${amount}`
          }
        }
      },
      series: [
        {
          type: 'treemap',
          data: treemapData,
          width: '100%',
          height: '100%',
          roam: false,
          nodeClick: false,
          breadcrumb: {
            show: false
          },
          label: {
            show: false
          },
          upperLabel: {
            show: false
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            gapWidth: 1
          },
          emphasis: {
            label: {
              show: false
            },
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0,0,0,0.3)',
              borderColor: '#333',
              borderWidth: 2
            }
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                gapWidth: 2
              }
            },
            {
              colorSaturation: [0.35, 0.5],
              itemStyle: {
                gapWidth: 1,
                borderColorSaturation: 0.6
              }
            }
          ]
        }
      ]
    }
  }, [bookings])

  if (!chartOption || !bookings || bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Keine Buchungen verfügbar</p>
        </div>
      </div>
    )
  }

  const onEvents = {
    mouseover: (params: any) => {
      if (params.data?.bookingId && onBookingHover) {
        onBookingHover(params.data.bookingId)
      }
    },
    mouseout: () => {
      if (onBookingHover) {
        onBookingHover(null)
      }
    }
  }

  return (
    <div className="w-full h-full">
      <ReactECharts 
        option={chartOption}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={onEvents}
      />
    </div>
  )
}

