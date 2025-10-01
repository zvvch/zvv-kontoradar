'use client'

import { useEffect, useState } from 'react'
import { Activity, Zap, Database } from 'lucide-react'
import { getMemoryUsage, measurePerformance } from '@/lib/performance'

interface PerformanceMetrics {
  memory: {
    used: number
    total: number
    percentage: number
  }
  renderTime: number
  dataLoadTime: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { used: 0, total: 0, percentage: 0 },
    renderTime: 0,
    dataLoadTime: 0
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateMetrics = () => {
      const memory = getMemoryUsage()
      setMetrics(prev => ({ ...prev, memory }))
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    updateMetrics() // Initial update

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors z-50"
        title="Performance Monitor"
      >
        <Activity className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Performance
          </h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-3 w-3 text-primary-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Memory</span>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-gray-900 dark:text-white">
              {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
            </div>
            <div className="text-xs text-gray-500">
              {metrics.memory.percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Memory Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              metrics.memory.percentage > 80
                ? 'bg-red-500'
                : metrics.memory.percentage > 60
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
          />
        </div>

        {/* Performance Tips */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {metrics.memory.percentage > 80 && (
            <div className="text-red-500">⚠️ Hohe Speichernutzung</div>
          )}
          {metrics.memory.percentage < 30 && (
            <div className="text-green-500">✅ Optimale Performance</div>
          )}
        </div>
      </div>
    </div>
  )
}
