'use client'

import { useMemo } from 'react'
import { TrendingDown, Calendar, DollarSign, Target, AlertTriangle } from 'lucide-react'

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

export function BurnDownChart({ 
  data, 
  okNumber, 
  title, 
  totalBudget = 0, 
  currentSpent = 0, 
  currentAvailable = 0 
}: BurnDownChartProps) {
  
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    // Sortiere Daten nach Datum
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Berechne Chart-Dimensionen für Burn-Down (verbleibendes Budget)
    const maxRemaining = Math.max(...sortedData.map(d => d.remaining))
    const maxIdealRemaining = Math.max(...sortedData.map(d => d.idealRemaining))
    const maxValue = Math.max(maxRemaining, maxIdealRemaining)
    
    // Chart-Konstanten (angepasst an neues ViewBox 120x70)
    const chartWidth = 120
    const chartHeight = 70
    const leftPadding = 18
    const rightPadding = 5
    const topPadding = 10
    const bottomPadding = 10
    
    // Generiere SVG-Pfade für Burn-Down
    const idealPath = sortedData.map((point, index) => {
      const x = leftPadding + (index / (sortedData.length - 1)) * (chartWidth - leftPadding - rightPadding)
      const y = chartHeight - bottomPadding - (point.idealRemaining / maxValue) * (chartHeight - topPadding - bottomPadding)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    const actualPath = sortedData.map((point, index) => {
      const x = leftPadding + (index / (sortedData.length - 1)) * (chartWidth - leftPadding - rightPadding)
      const y = chartHeight - bottomPadding - (point.remaining / maxValue) * (chartHeight - topPadding - bottomPadding)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    // Berechne Burn-Down Trend (wie viel Budget noch übrig ist)
    const firstRemaining = sortedData[0]?.remaining || 0
    const lastRemaining = sortedData[sortedData.length - 1]?.remaining || 0
    const idealLastRemaining = sortedData[sortedData.length - 1]?.idealRemaining || 0
    const burnDownEfficiency = firstRemaining > 0 ? ((firstRemaining - lastRemaining) / (firstRemaining - idealLastRemaining)) * 100 : 0

    return {
      idealPath,
      actualPath,
      burnDownEfficiency,
      maxValue,
      sortedData
    }
  }, [data])

  const getStatusColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    if (percentage > 60) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    return 'text-green-600 bg-green-50 dark:bg-green-900/20'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage > 80) return <AlertTriangle className="h-4 w-4" />
    if (percentage > 60) return <Target className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  if (!chartData || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <p>Keine Daten für Burn-Down Chart verfügbar</p>
        </div>
      </div>
    )
  }

  const currentPercentage = (currentSpent / totalBudget) * 100

  return (
    <div className="w-full h-full">
      {/* Chart */}
      <div className="h-full">
        <div className="relative">
          {/* SVG Chart */}
          <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-850 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <svg
              viewBox="0 0 120 70"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                </pattern>
              </defs>
              
              {/* Y-Axis Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = 60 - (ratio * 50)
                const value = Math.round(chartData.maxValue * ratio)
                return (
                  <g key={`y-label-${index}`}>
                    <line
                      x1="18"
                      y1={y}
                      x2="115"
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.2"
                      opacity="0.2"
                    />
                    <text
                      x="16"
                      y={y + 1}
                      textAnchor="end"
                      fontSize="2.5"
                      fill="currentColor"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {value.toLocaleString('de-CH', { 
                        style: 'currency', 
                        currency: 'CHF',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </text>
                  </g>
                )
              })}
              
              {/* Ideal Burn-Down Line (Soll) */}
              <path
                d={chartData.idealPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="2,2"
                opacity="0.7"
              />
              
              {/* Actual Burn-Down Line (Ist) */}
              <path
                d={chartData.actualPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data Points (Actual Burn-Down) */}
              {chartData.sortedData.map((point, index) => {
                const x = 18 + (index / (chartData.sortedData.length - 1)) * 97
                const y = 60 - (point.remaining / chartData.maxValue) * 50
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="#ef4444"
                    className="hover:r-2 transition-all"
                  />
                )
              })}
              
              {/* X-Axis Labels */}
              {chartData.sortedData.map((point, index) => {
                const x = 18 + (index / (chartData.sortedData.length - 1)) * 97
                const date = new Date(point.date)
                const month = date.toLocaleDateString('de-CH', { month: 'short' })
                const day = date.getDate()
                
                // Zeige nur jeden 2. oder 3. Label um Überlappung zu vermeiden
                if (index % Math.max(1, Math.floor(chartData.sortedData.length / 6)) === 0) {
                  return (
                    <g key={`label-${index}`}>
                      <text
                        x={x}
                        y="64"
                        textAnchor="middle"
                        fontSize="2.5"
                        fill="currentColor"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {month}
                      </text>
                      <text
                        x={x}
                        y="67.5"
                        textAnchor="middle"
                        fontSize="2"
                        fill="currentColor"
                        className="text-gray-500 dark:text-gray-500"
                      >
                        {day}
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500 opacity-70" style={{ borderTop: '2px dashed #10b981' }}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Ideal Burn-Down</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Actual Burn-Down</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
