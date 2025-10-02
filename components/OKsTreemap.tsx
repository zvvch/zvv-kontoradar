'use client'

import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { Layers } from 'lucide-react'
import { OKOverview } from '@/lib/types'

interface OKsTreemapProps {
  oks: OKOverview[]
  title: string
}

export function OKsTreemap({ oks, title }: OKsTreemapProps) {
  
  const chartOption = useMemo(() => {
    if (!oks || oks.length === 0) return null

    // Berechne Gesamtsumme für Prozent-Berechnung
    const totalSpent = oks.reduce((sum, ok) => sum + Math.abs(ok.spent || 0), 0)

    // Gut gemischte Farbpalette für maximale Unterscheidbarkeit
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
      '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#d946ef',
      '#fb923c', '#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6',
      '#60a5fa', '#f87171', '#a3e635', '#818cf8', '#2dd4bf', '#e879f9',
      '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777',
      '#0891b2', '#65a30d', '#ea580c', '#4f46e5', '#0d9488', '#c026d3',
      '#1d4ed8', '#b91c1c', '#047857', '#b45309', '#6d28d9', '#be185d',
      '#0e7490', '#4d7c0f', '#4338ca', '#0f766e', '#a21caf', '#0ea5e9',
      '#f43f5e', '#38bdf8', '#fb7185', '#0284c7', '#e11d48', '#0369a1',
      '#be123c', '#1e40af', '#991b1b', '#065f46', '#92400e', '#5b21b6',
      '#9f1239', '#155e75', '#3f6212', '#3730a3', '#115e59', '#86198f'
    ]

    // Erstelle Treemap-Daten
    const treemapData = oks.map((ok, index) => {
      const okSpent = Math.abs(ok.spent || 0)
      const percentage = (okSpent / totalSpent) * 100
      
      return {
        name: ok.ok_nr,
        value: okSpent,
        okId: ok.ok_id,
        itemStyle: {
          color: colors[index % colors.length]
        },
        label: {
          show: true,
          formatter: percentage >= 3 ? `${ok.ok_nr}\n${percentage.toFixed(1)}%` : percentage >= 1.5 ? `${percentage.toFixed(1)}%` : '',
          fontSize: percentage >= 5 ? 14 : 11,
          fontWeight: 'bold',
          color: '#fff',
          overflow: 'truncate'
        },
        tooltip: {
          formatter: () => {
            const spent = new Intl.NumberFormat('de-CH', {
              style: 'currency',
              currency: 'CHF',
              minimumFractionDigits: 0,
            }).format(okSpent)
            const budget = new Intl.NumberFormat('de-CH', {
              style: 'currency',
              currency: 'CHF',
              minimumFractionDigits: 0,
            }).format(ok.budget_total || 0)
            const available = new Intl.NumberFormat('de-CH', {
              style: 'currency',
              currency: 'CHF',
              minimumFractionDigits: 0,
            }).format(ok.available || 0)
            const utilization = ok.budget_total > 0 ? ((okSpent / ok.budget_total) * 100).toFixed(1) : '0.0'
            
            return `
              <strong>OK ${ok.ok_nr}</strong><br/>
              ${ok.title}<br/><br/>
              Budget: ${budget}<br/>
              Verbraucht: ${spent}<br/>
              Verfügbar: ${available}<br/>
              Auslastung: ${utilization}%<br/>
              Anteil: ${percentage.toFixed(2)}%
            `
          }
        }
      }
    })

    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: any) => {
          return params.data.tooltip?.formatter() || ''
        }
      },
      series: [
        {
          type: 'treemap',
          data: treemapData,
          width: '100%',
          height: '100%',
          roam: false,
          nodeClick: 'link',
          breadcrumb: {
            show: false
          },
          label: {
            show: true
          },
          upperLabel: {
            show: false
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 2
          },
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0,0,0,0.3)',
              borderColor: '#333',
              borderWidth: 3
            }
          }
        }
      ]
    }
  }, [oks])

  if (!chartOption || !oks || oks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Keine OKs verfügbar</p>
        </div>
      </div>
    )
  }

  const onEvents = {
    click: (params: any) => {
      if (params.data?.okId) {
        window.location.href = `/ok/${params.data.okId}`
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

