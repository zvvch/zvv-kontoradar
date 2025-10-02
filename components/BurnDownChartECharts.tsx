'use client'

import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { Calendar } from 'lucide-react'

interface BurnDownData {
  date: string
  budget: number
  spent: number
  available: number
  remaining: number
  idealRemaining: number
  percentage: number
}

interface BurnDownChartProps {
  data: BurnDownData[]
  okNumber: string
  title: string
  totalBudget: number
  currentSpent: number
  currentAvailable: number
}

export function BurnDownChartECharts({ 
  data, 
  okNumber, 
  title, 
  totalBudget = 0, 
  currentSpent = 0, 
  currentAvailable = 0 
}: BurnDownChartProps) {
  
  const chartOption = useMemo(() => {
    if (data.length === 0) return null

    // Sortiere und formatiere Daten
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const dates = sortedData.map(item => {
      const date = new Date(item.date)
      // Zeige Tag.Monat wenn viele Datenpunkte, sonst Monat Jahr
      if (sortedData.length > 20) {
        return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
      } else {
        return date.toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: '2-digit' })
      }
    })
    // Burn-Down: Verfügbares Budget (geht runter)
    const idealData = sortedData.map(item => item.idealRemaining)
    const actualData = sortedData.map(item => item.remaining)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: any) => {
          const date = params[0].axisValue
          let tooltip = `<strong>${date}</strong><br/>`
          params.forEach((param: any) => {
            const value = new Intl.NumberFormat('de-CH', {
              style: 'currency',
              currency: 'CHF',
              minimumFractionDigits: 0,
            }).format(param.value)
            tooltip += `${param.marker} ${param.seriesName}: ${value}<br/>`
          })
          return tooltip
        }
      },
      legend: {
        data: ['Verfügbar (Ideal)', 'Verfügbar (Ist)'],
        bottom: 10,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          fontSize: 11
        },
        axisLine: {
          lineStyle: {
            color: '#9ca3af'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`
            }
            return value.toString()
          },
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e7eb'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#9ca3af'
          }
        }
      },
      series: [
        {
          name: 'Verfügbar (Ideal)',
          type: 'line',
          data: idealData,
          smooth: true,
          lineStyle: {
            color: '#10b981',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#10b981'
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: 'Verfügbar (Ist)',
          type: 'line',
          data: actualData,
          smooth: true,
          lineStyle: {
            color: '#ef4444',
            width: 3
          },
          itemStyle: {
            color: '#ef4444'
          },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    }
  }, [data])

  if (!chartOption || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Keine Daten verfügbar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ReactECharts 
        option={chartOption}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
        theme="light"
      />
    </div>
  )
}

