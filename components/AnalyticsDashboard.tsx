'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { OKOverview, AccountOverview } from '@/lib/types'
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, 
  Calendar, DollarSign, Target, AlertTriangle,
  CheckCircle, Clock, Users, Building2
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'

interface AnalyticsData {
  totalBudget: number
  totalSpent: number
  totalAvailable: number
  averageUtilization: number
  criticalCount: number
  warningCount: number
  healthyCount: number
  monthlyTrend: { month: string; spent: number; budget: number }[]
  topAccounts: { name: string; spent: number; budget: number }[]
  utilizationDistribution: { range: string; count: number }[]
}

export function AnalyticsDashboard() {
  const [okOverviews, setOkOverviews] = useState<OKOverview[]>([])
  const [accountOverviews, setAccountOverviews] = useState<AccountOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [okData, accountData] = await Promise.all([
        supabase.from('v_ok_overview').select('*'),
        supabase.from('v_account_overview').select('*')
      ])

      if (okData.error) throw okData.error
      if (accountData.error) throw accountData.error

      setOkOverviews(okData.data || [])
      setAccountOverviews(accountData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Analytics-Daten')
    } finally {
      setLoading(false)
    }
  }

  const analyticsData = useMemo((): AnalyticsData => {
    const totalBudget = okOverviews.reduce((sum, ok) => sum + ok.budget_total, 0)
    const totalSpent = okOverviews.reduce((sum, ok) => sum + ok.spent, 0)
    const totalAvailable = totalBudget - totalSpent
    const averageUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    // Status-Verteilung
    let criticalCount = 0, warningCount = 0, healthyCount = 0
    okOverviews.forEach(ok => {
      const utilization = (ok.spent / ok.budget_total) * 100
      if (utilization > 80) criticalCount++
      else if (utilization > 50) warningCount++
      else healthyCount++
    })

    // Top Accounts
    const topAccounts = accountOverviews
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5)
      .map(acc => ({
        name: acc.account_name,
        spent: acc.total_spent,
        budget: acc.total_budget
      }))

    // Utilization Distribution
    const utilizationDistribution = [
      { range: '0-25%', count: okOverviews.filter(ok => (ok.spent / ok.budget_total) * 100 <= 25).length },
      { range: '25-50%', count: okOverviews.filter(ok => {
        const util = (ok.spent / ok.budget_total) * 100
        return util > 25 && util <= 50
      }).length },
      { range: '50-75%', count: okOverviews.filter(ok => {
        const util = (ok.spent / ok.budget_total) * 100
        return util > 50 && util <= 75
      }).length },
      { range: '75-100%', count: okOverviews.filter(ok => (ok.spent / ok.budget_total) * 100 > 75).length }
    ]

    // Mock monthly trend (in real app, this would come from time-series data)
    const monthlyTrend = [
      { month: 'Jan', spent: totalSpent * 0.8, budget: totalBudget * 0.8 },
      { month: 'Feb', spent: totalSpent * 0.85, budget: totalBudget * 0.85 },
      { month: 'Mär', spent: totalSpent * 0.9, budget: totalBudget * 0.9 },
      { month: 'Apr', spent: totalSpent * 0.95, budget: totalBudget * 0.95 },
      { month: 'Mai', spent: totalSpent, budget: totalBudget }
    ]

    return {
      totalBudget,
      totalSpent,
      totalAvailable,
      averageUtilization,
      criticalCount,
      warningCount,
      healthyCount,
      monthlyTrend,
      topAccounts,
      utilizationDistribution
    }
  }, [okOverviews, accountOverviews])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="glass-card p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Lade Analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card border-red-500/20 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-full bg-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Fehler</h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-purple-600 pulse-glow">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Tiefe Einblicke in Budgetverbrauch und Trends
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="glass-input text-sm"
            >
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="1y">Letztes Jahr</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 float hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-blue-600">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamtbudget</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(analyticsData.totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 float hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-orange-600">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verbraucht</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(analyticsData.totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 float hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-green-600">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verfügbar</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(analyticsData.totalAvailable)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 float hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-purple-600">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Durchschn. Auslastung</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analyticsData.averageUtilization.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 rounded-xl bg-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gesunde OKs</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {analyticsData.healthyCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((analyticsData.healthyCount / okOverviews.length) * 100).toFixed(1)}% aller OKs
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Warnungen</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {analyticsData.warningCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((analyticsData.warningCount / okOverviews.length) * 100).toFixed(1)}% aller OKs
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 rounded-xl bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kritische OKs</h3>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            {analyticsData.criticalCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {((analyticsData.criticalCount / okOverviews.length) * 100).toFixed(1)}% aller OKs
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Distribution - Pie Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-600">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Auslastungsverteilung</h3>
          </div>
          
          <div className="h-80 min-h-[320px]">
            <ReactECharts
              option={{
                tooltip: {
                  trigger: 'item',
                  formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                  bottom: 10,
                  left: 'center'
                },
                series: [
                  {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                      borderRadius: 10,
                      borderColor: '#fff',
                      borderWidth: 2
                    },
                    label: {
                      show: true,
                      formatter: '{b}: {c}'
                    },
                    emphasis: {
                      label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                      }
                    },
                    data: analyticsData.utilizationDistribution.map((item, index) => ({
                      value: item.count,
                      name: item.range,
                      itemStyle: { color: COLORS[index % COLORS.length] }
                    }))
                  }
                ]
              }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* Top Accounts - Bar Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Konten</h3>
          </div>
          
          <div className="h-80 min-h-[320px]">
            <ReactECharts
              option={{
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'shadow'
                  },
                  formatter: (params: any) => {
                    const value = formatCurrency(params[0].value)
                    return `${params[0].name}<br/>${params[0].marker}Verbraucht: ${value}`
                  }
                },
                grid: {
                  left: '3%',
                  right: '4%',
                  bottom: '15%',
                  containLabel: true
                },
                xAxis: {
                  type: 'category',
                  data: analyticsData.topAccounts.map(a => a.name),
                  axisLabel: {
                    rotate: 45,
                    fontSize: 10
                  }
                },
                yAxis: {
                  type: 'value',
                  axisLabel: {
                    formatter: (value: number) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                      return value.toString()
                    }
                  }
                },
                series: [
                  {
                    name: 'Verbraucht',
                    type: 'bar',
                    data: analyticsData.topAccounts.map(a => a.spent),
                    itemStyle: {
                      color: '#8b5cf6',
                      borderRadius: [4, 4, 0, 0]
                    }
                  }
                ]
              }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Monthly Trend - Bar Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-green-600">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monatlicher Trend</h3>
        </div>
        
        <div className="h-80 min-h-[320px]">
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                },
                formatter: (params: any) => {
                  let tooltip = `<strong>${params[0].axisValue}</strong><br/>`
                  params.forEach((param: any) => {
                    const value = formatCurrency(param.value)
                    tooltip += `${param.marker}${param.seriesName}: ${value}<br/>`
                  })
                  return tooltip
                }
              },
              legend: {
                bottom: 10,
                data: ['Budget', 'Verbraucht']
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                data: analyticsData.monthlyTrend.map(m => m.month)
              },
              yAxis: {
                type: 'value',
                axisLabel: {
                  formatter: (value: number) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                    return value.toString()
                  }
                }
              },
              series: [
                {
                  name: 'Budget',
                  type: 'bar',
                  data: analyticsData.monthlyTrend.map(m => m.budget),
                  itemStyle: {
                    color: '#10b981',
                    borderRadius: [4, 4, 0, 0]
                  }
                },
                {
                  name: 'Verbraucht',
                  type: 'bar',
                  data: analyticsData.monthlyTrend.map(m => m.spent),
                  itemStyle: {
                    color: '#ef4444',
                    borderRadius: [4, 4, 0, 0]
                  }
                }
              ]
            }}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

