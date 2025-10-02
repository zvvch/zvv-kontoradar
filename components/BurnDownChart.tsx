'use client'

import { useMemo } from 'react'
import { TrendingDown, Calendar, DollarSign, Target, AlertTriangle } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

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
    if (data.length === 0) return []

    // Sortiere Daten nach Datum und formatiere für Recharts
    const sortedData = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        month: new Date(item.date).toLocaleDateString('de-CH', { month: 'short' }),
        dateFormatted: new Date(item.date).toLocaleDateString('de-CH')
      }))

    return sortedData
  }, [data])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

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

  if (!chartData || chartData.length === 0) {
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
      {/* Chart Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">OK {okNumber}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentPercentage)}`}>
            {currentPercentage.toFixed(1)}% verbraucht
          </div>
        </div>
      </div>

      {/* Recharts Burn-Down Chart */}
      <div className="h-96 w-1/2 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 50,
              left: 60,
              bottom: 60,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              opacity={0.1}
              className="dark:opacity-20"
            />
            <XAxis 
              dataKey="month"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 0)}k`
                }
                return value.toString()
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            
            {/* Ideal Burn-Down Line (Soll) */}
            <Line
              type="monotone"
              dataKey="idealRemaining"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Ideal (Soll)"
              connectNulls={false}
            />
            
            {/* Actual Burn-Down Line (Ist) */}
            <Line
              type="monotone"
              dataKey="remaining"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
              name="Actual (Ist)"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalBudget)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Gesamtbudget</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(currentSpent)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Verbraucht</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(currentAvailable)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Verfügbar</div>
        </div>
      </div>
    </div>
  )
}
