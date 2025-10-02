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
    
    // Intelligente Schritt-Berechnung (Ziel: 5-8 Schritte)
    const calculateStep = (max: number): number => {
      const targetSteps = 6
      const roughStep = max / targetSteps
      
      // Finde nächste "schöne" Zahl: 1, 2, 5, 10, 20, 50, 100, etc.
      const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
      const normalized = roughStep / magnitude
      
      let niceStep
      if (normalized <= 1) niceStep = 1
      else if (normalized <= 2) niceStep = 2
      else if (normalized <= 5) niceStep = 5
      else niceStep = 10
      
      return niceStep * magnitude
    }
    
    const step = calculateStep(maxValue)
    const maxRounded = Math.ceil(maxValue / step) * step
    
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
      const y = chartHeight - bottomPadding - (point.idealRemaining / maxRounded) * (chartHeight - topPadding - bottomPadding)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    const actualPath = sortedData.map((point, index) => {
      const x = leftPadding + (index / (sortedData.length - 1)) * (chartWidth - leftPadding - rightPadding)
      const y = chartHeight - bottomPadding - (point.remaining / maxRounded) * (chartHeight - topPadding - bottomPadding)
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
      maxRounded,
      step,
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
              
              {/* Y-Axis Labels (dynamische Schritte) */}
              {(() => {
                const numSteps = Math.floor(chartData.maxRounded / chartData.step) + 1
                const steps = Array.from({ length: numSteps }, (_, i) => i * chartData.step)
                
                return steps.map((value, index) => {
                  const ratio = value / chartData.maxRounded
                  const y = 60 - (ratio * 50)
                  
                  // Intelligente Formatierung
                  let label
                  if (value >= 1000000) {
                    label = `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
                  } else if (value >= 1000) {
                    label = `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 0)}k`
                  } else {
                    label = value.toString()
                  }
                  
                  return (
                    <g key={`y-label-${index}`}>
                      <line
                        x1="18"
                        y1={y}
                        x2="115"
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="0.15"
                        opacity="0.15"
                      />
                      <text
                        x="16"
                        y={y + 1}
                        textAnchor="end"
                        fontSize="2.5"
                        fill="currentColor"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {label}
                      </text>
                    </g>
                  )
                })
              })()}
              
              {/* Ideal Burn-Down Line (Soll) */}
              <path
                d={chartData.idealPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              
              {/* Actual Burn-Down Line (Ist) */}
              <path
                d={chartData.actualPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data Points (Actual Burn-Down) */}
              {chartData.sortedData.map((point, index) => {
                const x = 18 + (index / (chartData.sortedData.length - 1)) * 97
                const y = 60 - (point.remaining / chartData.maxRounded) * 50
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1"
                    fill="#ef4444"
                    className="hover:r-1.5 transition-all"
                  />
                )
              })}
              
              {/* X-Axis Labels (Monatsnamen) */}
              {chartData.sortedData.map((point, index) => {
                const x = 18 + (index / (chartData.sortedData.length - 1)) * 97
                const date = new Date(point.date)
                const month = date.toLocaleDateString('de-CH', { month: 'short' })
                
                return (
                  <g key={`label-${index}`}>
                    <text
                      x={x}
                      y="66"
                      textAnchor="middle"
                      fontSize="2.5"
                      fill="currentColor"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {month}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-green-500 opacity-70" style={{ borderTop: '2px dashed #10b981' }}></div>
              <span className="text-xs text-gray-500 dark:text-gray-500">Ideal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-xs text-gray-500 dark:text-gray-500">Actual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
