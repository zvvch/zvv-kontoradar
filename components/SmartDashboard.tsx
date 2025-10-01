'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OKOverview, AccountOverview, Booking, getBudgetStatus } from '@/lib/types'
import { useResolvedTheme } from '@/lib/theme'
import { ColumnFilter } from '@/components/ColumnFilter'
import { DateFilter } from '@/components/DateFilter'
import { BurnDownChart } from '@/components/BurnDownChart'
import { 
  Search, Filter, SortAsc, SortDesc, Eye, Download, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Calendar, DollarSign, Building2, Users, Target,
  ChevronDown, X, Save, RefreshCw, Settings,
  BarChart3, PieChart, Activity, Zap
} from 'lucide-react'

interface FilterState {
  search: string
  dateRange: { start: string; end: string }
  budgetRange: { min: number; max: number }
  status: string[]
  accounts: string[]
  oks: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'table' | 'cards' | 'kanban'
  groupBy: 'none' | 'account' | 'status' | 'date'
  // Excel-ähnliche Spaltenfilter
  columnFilters: {
    booking_date: string[]
    ok_nr: string[]
    title: string[]
    konto_nr: string[]
    account_name: string[]
    budget_total: string[]
    spent: string[]
    available: string[]
    status: string[]
  }
}

interface SavedView {
  id: string
  name: string
  filters: FilterState
  isDefault: boolean
}

export function SmartDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [okOverviews, setOkOverviews] = useState<OKOverview[]>([])
  const [accountOverviews, setAccountOverviews] = useState<AccountOverview[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'analytics'>('overview')
  const [showFilters, setShowFilters] = useState(false)
  const [showBurnDown, setShowBurnDown] = useState(false)
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [currentView, setCurrentView] = useState<string>('default')
  
  const theme = useResolvedTheme()

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: { start: '', end: '' },
    budgetRange: { min: 0, max: 1000000 },
    status: [],
    accounts: [],
    oks: [],
    sortBy: 'ok_nr',
    sortOrder: 'asc',
    viewMode: 'table',
    groupBy: 'none',
    columnFilters: {
      booking_date: [],
      ok_nr: [],
      title: [],
      konto_nr: [],
      account_name: [],
      budget_total: [],
      spent: [],
      available: [],
      status: []
    }
  })

  useEffect(() => {
    fetchData()
    loadSavedViews()
    applyUrlFilters()
  }, [searchParams])

  // Schließe Burn-Down Chart automatisch wenn Bedingung nicht mehr erfüllt
  useEffect(() => {
    if (!canShowBurnDown && showBurnDown) {
      setShowBurnDown(false)
    }
  }, [canShowBurnDown, showBurnDown])

  // Excel-like Column + Row Hover Effect
  useEffect(() => {
    const table = document.getElementById('data-table')
    if (!table) return

    // Header-Hover: Spalte highlighten
    const handleThHover = (e: MouseEvent) => {
      const th = (e.target as HTMLElement).closest('th')
      if (!th) return

      const index = Array.from(th.parentElement?.children || []).indexOf(th)
      if (index === -1) return

      const cells = table.querySelectorAll(`tr > *:nth-child(${index + 1})`)
      cells.forEach(cell => cell.classList.add('column-hover'))
    }

    const handleThLeave = () => {
      const cells = table.querySelectorAll('.column-hover')
      cells.forEach(cell => cell.classList.remove('column-hover'))
    }

    // Body-Cell-Hover: Zeile + Spalte + aktive Zelle highlighten
    const handleTdHover = (e: MouseEvent) => {
      const td = (e.target as HTMLElement).closest('td')
      if (!td) return

      const tr = td.parentElement
      const index = Array.from(tr?.children || []).indexOf(td)
      if (index === -1) return

      // Highlighte Zeile
      const rowCells = tr?.querySelectorAll('td')
      rowCells?.forEach(cell => cell.classList.add('row-hover'))

      // Highlighte Spalte
      const colCells = table.querySelectorAll(`tbody tr > td:nth-child(${index + 1})`)
      colCells.forEach(cell => cell.classList.add('column-hover'))

      // Highlighte aktive Zelle
      td.classList.add('cell-active')
    }

    const handleTdLeave = () => {
      const rowCells = table.querySelectorAll('.row-hover')
      rowCells.forEach(cell => cell.classList.remove('row-hover'))

      const colCells = table.querySelectorAll('.column-hover')
      colCells.forEach(cell => cell.classList.remove('column-hover'))

      const activeCells = table.querySelectorAll('.cell-active')
      activeCells.forEach(cell => cell.classList.remove('cell-active'))
    }

    const thead = table.querySelector('thead')
    const tbody = table.querySelector('tbody')

    if (thead) {
      thead.addEventListener('mouseover', handleThHover)
      thead.addEventListener('mouseout', handleThLeave)
    }

    if (tbody) {
      tbody.addEventListener('mouseover', handleTdHover)
      tbody.addEventListener('mouseout', handleTdLeave)
    }
      
    return () => {
      if (thead) {
        thead.removeEventListener('mouseover', handleThHover)
        thead.removeEventListener('mouseout', handleThLeave)
      }
      if (tbody) {
        tbody.removeEventListener('mouseover', handleTdHover)
        tbody.removeEventListener('mouseout', handleTdLeave)
      }
    }
  }, [okOverviews, filters])

  // URL-Parameter für Filter anwenden
  const applyUrlFilters = () => {
    const datumParams = searchParams.getAll('Datum')
    const okParams = searchParams.getAll('OK')
    const kontoParams = searchParams.getAll('Konto')
    const titelParams = searchParams.getAll('Titel')
    const budgetParams = searchParams.getAll('Budget')
    const verbrauchtParams = searchParams.getAll('Verbraucht')
    const verfuegbarParams = searchParams.getAll('Verfuegbar')
    const statusParams = searchParams.getAll('Status')
    
    if (
      datumParams.length > 0 ||
      okParams.length > 0 || 
      kontoParams.length > 0 || 
      titelParams.length > 0 ||
      budgetParams.length > 0 ||
      verbrauchtParams.length > 0 ||
      verfuegbarParams.length > 0 ||
      statusParams.length > 0
    ) {
      setFilters(prev => ({
        ...prev,
        columnFilters: {
          ...prev.columnFilters,
          booking_date: datumParams,
          ok_nr: okParams,
          konto_nr: kontoParams,
          title: titelParams,
          budget_total: budgetParams,
          spent: verbrauchtParams,
          available: verfuegbarParams,
          status: statusParams
        }
      }))
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [okData, accountData, bookingData] = await Promise.all([
        supabase.from('v_ok_overview').select('*'),
        supabase.from('v_account_overview').select('*'),
        supabase.from('booking').select('*').limit(1000)
      ])

      if (okData.error) throw okData.error
      if (accountData.error) throw accountData.error
      if (bookingData.error) throw bookingData.error

      setOkOverviews(okData.data || [])
      setAccountOverviews(accountData.data || [])
      setBookings(bookingData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedViews = () => {
    const saved = localStorage.getItem('savedViews')
    if (saved) {
      const views = JSON.parse(saved)
      setSavedViews(views)
    }
  }

  const saveCurrentView = () => {
    const viewName = prompt('Name für diese Ansicht:')
    if (!viewName) return

    const newView: SavedView = {
      id: Date.now().toString(),
      name: viewName,
      filters,
      isDefault: false
    }

    const updatedViews = [...savedViews, newView]
    setSavedViews(updatedViews)
    localStorage.setItem('savedViews', JSON.stringify(updatedViews))
  }

  // Excel-ähnliche Spaltenfilter mit URL-Update
  const handleColumnFilterChange = (column: string, values: string[]) => {
    // Sanfte Transition starten
    setIsTransitioning(true)
    
    const newFilters = {
      ...filters.columnFilters,
      [column]: values
    }
    
    setFilters(prev => ({
      ...prev,
      columnFilters: newFilters
    }))

    // URL-Parameter aktualisieren
    updateUrlWithFilters(newFilters)
    
    // Transition nach kurzer Zeit beenden
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // URL mit Filtern aktualisieren
  const updateUrlWithFilters = (columnFilters: typeof filters.columnFilters) => {
    const params = new URLSearchParams()

    // Füge alle aktiven Filter zur URL hinzu
    Object.entries(columnFilters).forEach(([column, values]) => {
      if (values.length > 0) {
        values.forEach(value => {
          // Verwende sprechende Parameter-Namen
          const paramName = column === 'first_booking' ? 'Datum' :
                          column === 'ok_nr' ? 'OK' : 
                          column === 'konto_nr' ? 'Konto' :
                          column === 'title' ? 'Titel' :
                          column === 'budget_total' ? 'Budget' :
                          column === 'spent' ? 'Verbraucht' :
                          column === 'available' ? 'Verfuegbar' :
                          column === 'status' ? 'Status' :
                          column
          
          params.append(paramName, value)
        })
      }
    })

    // Erstelle neue URL
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    // Update URL ohne Seite neu zu laden
    router.push(newUrl, { scroll: false })
  }

  // Generiere Filteroptionen für jede Spalte
  const getColumnOptions = (column: keyof OKOverview): string[] => {

    const uniqueValues = Array.from(new Set(okOverviews.map(ok => {
      const value = ok[column]
      if (typeof value === 'string') return value
      if (typeof value === 'number') return value.toString()
      return String(value || '')
    })))
    
    // Sortierung: Zahlen/Beträge absteigend (größte zuerst), Text alphabetisch
    return uniqueValues.sort((a, b) => {
      // Prüfe ob es Zahlen/Beträge sind (Budget, Verbraucht, Verfügbar)
      const isNumeric = /^[\d\s'.,]+$/.test(a) && /^[\d\s'.,]+$/.test(b)
      
      if (isNumeric) {
        // Zahlen: Absteigend sortieren (größte zuerst)
        const numA = parseFloat(a.replace(/['\s]/g, ''))
        const numB = parseFloat(b.replace(/['\s]/g, ''))
        return numB - numA
      } else {
        // Text: Alphabetisch aufsteigend
        return a.localeCompare(b, 'de')
      }
    })
  }

  // URL für mehrere OKs generieren
  const generateMultiOKUrl = (okNumbers: string[]): string => {
    const params = okNumbers.map(ok => `OK=${ok}`).join('&')
    return `/?${params}`
  }

  // URL für mehrere Konten generieren
  const generateMultiKontoUrl = (kontoNumbers: string[]): string => {
    const params = kontoNumbers.map(konto => `Konto=${konto}`).join('&')
    return `/?${params}`
  }

  // Intelligente Filterung mit Memoization
  const filteredData = useMemo(() => {
    let filtered = okOverviews

    // Text-Suche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(ok => 
        ok.ok_nr.toLowerCase().includes(searchLower) ||
        ok.title.toLowerCase().includes(searchLower) ||
        ok.account_name.toLowerCase().includes(searchLower) ||
        ok.konto_nr.toLowerCase().includes(searchLower)
      )
    }

    // Excel-ähnliche Spaltenfilter
    Object.entries(filters.columnFilters).forEach(([column, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(ok => {
        // Spezialbehandlung für Datum-Filter (Jahr/Monat)
        if (column === 'booking_date' && ok.first_booking) {
          const date = new Date(ok.first_booking)
          const year = date.getFullYear().toString()
          const monthYear = date.toLocaleDateString('de-CH', { year: 'numeric', month: 'long' })
          
          // Prüfe ob Jahr oder Monat/Jahr ausgewählt ist
          return values.includes(year) || values.includes(monthYear)
        }
          
          const okValue = ok[column as keyof OKOverview]
          const stringValue = typeof okValue === 'string' ? okValue : String(okValue || '')
          return values.some(filterValue => 
            stringValue.toLowerCase().includes(filterValue.toLowerCase())
          )
        })
      }
    })

    // Status-Filter (legacy)
    if (filters.status.length > 0) {
      filtered = filtered.filter(ok => {
        const status = getBudgetStatus(ok.available, ok.budget_total).status
        return filters.status.includes(status)
      })
    }

    // Account-Filter (legacy)
    if (filters.accounts.length > 0) {
      filtered = filtered.filter(ok => filters.accounts.includes(ok.account_id))
    }

    // OK-Filter (legacy)
    if (filters.oks.length > 0) {
      filtered = filtered.filter(ok => filters.oks.includes(ok.ok_id))
    }

    // Budget-Range Filter
    filtered = filtered.filter(ok => 
      ok.budget_total >= filters.budgetRange.min && 
      ok.budget_total <= filters.budgetRange.max
    )

    // Datum-Filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(ok => ok.first_booking && ok.first_booking >= filters.dateRange.start)
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(ok => ok.last_booking && ok.last_booking <= filters.dateRange.end)
    }

    // Sortierung
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortBy as keyof OKOverview]
      let bVal: any = b[filters.sortBy as keyof OKOverview]
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [okOverviews, filters])

  // Prüfe ob Filter aktiv sind
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters.columnFilters).some(arr => arr.length > 0) ||
           filters.search ||
           filters.status.length > 0 ||
           filters.accounts.length > 0 ||
           filters.oks.length > 0 ||
           filters.dateRange.start ||
           filters.dateRange.end
  }, [filters])

  // Prüfe ob Burn-Down Chart angezeigt werden kann (nur bei genau 1 OK)
  const canShowBurnDown = useMemo(() => {
    const hasExactlyOneOK = filters.columnFilters.ok_nr.length === 1
    const hasAccountFilter = filters.columnFilters.konto_nr.length > 0
    
    // Zeige nur wenn genau 1 OK ausgewählt und kein Konto-Filter aktiv
    return hasExactlyOneOK && !hasAccountFilter
  }, [filters.columnFilters.ok_nr, filters.columnFilters.konto_nr])

  // Generiere Burn-Down Daten für gefilterte OKs
  const burnDownData = useMemo(() => {
    if (!hasActiveFilters || filteredData.length === 0) return []

    // Gruppiere nach OK für individuelle Charts
    const okGroups = filteredData.reduce((groups, ok) => {
      if (!groups[ok.ok_nr]) {
        groups[ok.ok_nr] = {
          ok,
          data: []
        }
      }
      return groups
    }, {} as Record<string, { ok: OKOverview, data: any[] }>)

    // Generiere historische Daten für jeden OK
    Object.values(okGroups).forEach(({ ok, data }) => {
      const startDate = new Date(ok.first_booking || new Date())
      const endDate = new Date(ok.last_booking || new Date())
      const months = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      
      for (let i = 0; i <= months; i++) {
        const date = new Date(startDate)
        date.setMonth(date.getMonth() + i)
        
        // Simuliere linearen Verbrauch mit Varianz
        const progress = Math.min(1, i / months)
        const variance = (Math.random() - 0.5) * 0.1
        const spent = Math.abs(ok.spent || 0) * (progress + variance)
        const available = (ok.budget_total || 0) - spent
        
        data.push({
          date: date.toISOString().split('T')[0],
          budget: ok.budget_total || 0,
          spent: Math.max(0, spent),
          available: Math.max(0, available),
          remaining: Math.max(0, (ok.budget_total || 0) - spent), // Verbleibendes Budget
          idealRemaining: Math.max(0, (ok.budget_total || 0) * (1 - progress)), // Ideales verbleibendes Budget
          percentage: (spent / (ok.budget_total || 1)) * 100
        })
      }
    })

    return Object.values(okGroups)
  }, [filteredData, hasActiveFilters])

  // Gruppierung
  const groupedData = useMemo(() => {
    if (filters.groupBy === 'none') {
      return [{ groupName: 'Alle', items: filteredData }]
    }

    const groups: { [key: string]: OKOverview[] } = {}
    
    const formatMonthYear = (isoDate: string | null): string => {
      if (!isoDate) return 'Kein Datum'
      const date = new Date(isoDate)
      if (isNaN(date.getTime())) return 'Kein Datum'
      return date.toLocaleDateString('de-CH', { year: 'numeric', month: 'long' })
    }
    
    filteredData.forEach(ok => {
      let groupKey = ''
      
      switch (filters.groupBy) {
        case 'account':
          groupKey = ok.account_name
          break
        case 'status':
          groupKey = getBudgetStatus(ok.available, ok.budget_total).status
          break
        case 'date':
          groupKey = formatMonthYear(ok.first_booking)
          break
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(ok)
    })

    return Object.entries(groups).map(([groupName, items]) => ({
      groupName,
      items
    }))
  }, [filteredData, filters.groupBy])

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '0.00 CHF'
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Daten...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fehler</h3>
            <p className="text-gray-700 dark:text-gray-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">

      {/* Filter-Bereich */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Filter:
            </span>
          
          {Object.values(filters.columnFilters).some(arr => arr.length > 0) ? (
            <>
              
              {/* Datum Filter */}
              {filters.columnFilters.booking_date.length > 0 && filters.columnFilters.booking_date.map((value) => (
                <button
                  key={value}
                  onClick={() => handleColumnFilterChange('booking_date', filters.columnFilters.booking_date.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Datum:</strong> 
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
              ))}
              
              {/* Titel Filter */}
              {filters.columnFilters.title.length > 0 && filters.columnFilters.title.map((value) => (
                <button
                  key={value}
                  onClick={() => handleColumnFilterChange('title', filters.columnFilters.title.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Titel:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
              ))}
              
              {/* Konto Filter */}
              {filters.columnFilters.konto_nr.length > 0 && filters.columnFilters.konto_nr.map((value) => (
                <button
                  key={value}
                  onClick={() => handleColumnFilterChange('konto_nr', filters.columnFilters.konto_nr.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Konto:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
              ))}
              
              {/* OK Filter */}
              {filters.columnFilters.ok_nr.length > 0 && filters.columnFilters.ok_nr.map((value) => (
                <button
                  key={value}
                  onClick={() => handleColumnFilterChange('ok_nr', filters.columnFilters.ok_nr.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">OK:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
              ))}
              
              {/* Budget Filter */}
              {filters.columnFilters.budget_total.length > 0 && filters.columnFilters.budget_total.map((value) => (
            <button
                  key={value}
                  onClick={() => handleColumnFilterChange('budget_total', filters.columnFilters.budget_total.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Budget:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
              ))}
            
              {/* Verbraucht Filter */}
              {filters.columnFilters.spent.length > 0 && filters.columnFilters.spent.map((value) => (
            <button
                  key={value}
                  onClick={() => handleColumnFilterChange('spent', filters.columnFilters.spent.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Verbraucht:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
              ))}
            
              {/* Verfügbar Filter */}
              {filters.columnFilters.available.length > 0 && filters.columnFilters.available.map((value) => (
            <button
                  key={value}
                  onClick={() => handleColumnFilterChange('available', filters.columnFilters.available.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Verfügbar:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
              ))}
            
              {/* Status Filter */}
              {filters.columnFilters.status.length > 0 && filters.columnFilters.status.map((value) => (
            <button
                  key={value}
                  onClick={() => handleColumnFilterChange('status', filters.columnFilters.status.filter(v => v !== value))}
                  className="group text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-primary-200 dark:border-primary-700 flex items-center gap-1.5 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  title="Klicken zum Entfernen"
                >
                  <strong className="text-gray-900 dark:text-gray-100">Status:</strong>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  <X className="h-3 w-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
              ))}
              
            </>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              Keine Filter aktiv
            </span>
          )}
          </div>

          {/* Burn-Down Chart Button - nur sichtbar wenn genau 1 OK gefiltert ist */}
          {canShowBurnDown && (
            <button
              onClick={() => setShowBurnDown(!showBurnDown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showBurnDown
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Burn-Down Chart
              {showBurnDown && <X className="h-3 w-3" />}
            </button>
          )}
            </div>
          </div>

      {/* Burn-Down Chart - Zeige nur wenn Button aktiviert UND genau 1 OK gefiltert ist */}
      {showBurnDown && canShowBurnDown && burnDownData.length > 0 && (
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {burnDownData.map(({ ok, data }) => {
              const budgetStatus = getBudgetStatus(ok.available, ok.budget_total)
              return (
                <div key={ok.ok_id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="grid grid-cols-[300px_1fr] gap-8">
                    {/* Linke Spalte - Infos (feste Breite) */}
                    <div className="flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          Burn-Down Chart
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {ok.ok_nr} - {ok.title}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Gesamtbudget</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {(ok.budget_total || 0).toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Verbraucht</span>
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {Math.abs(ok.spent || 0).toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Verfügbar</span>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {(ok.available || 0).toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                            <span className={`text-lg font-bold ${budgetStatus.color}`}>
                              {budgetStatus.percentage.toFixed(1)}% verbraucht
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rechte Spalte - Chart (volle Breite) */}
                    <div className="min-h-[300px]">
                      <BurnDownChart 
                        data={data} 
                        okNumber={ok.ok_nr}
                        title={ok.title}
                        totalBudget={ok.budget_total || 0}
                        currentSpent={Math.abs(ok.spent || 0)}
                        currentAvailable={ok.available || 0}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabelle */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {groupedData.map(({ groupName, items: groupData }) => (
          <div key={groupName} className="flex-1 flex flex-col min-h-0">
            
            <div className="flex-1 overflow-y-scroll scrollbar-thin">
              <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              <table className="w-full text-sm border-collapse" id="data-table">
                <thead className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850 sticky top-0 z-10 shadow-sm border-b border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-0 py-0 text-center">
                      <DateFilter
                        selectedValues={filters.columnFilters.booking_date}
                        onFilterChange={(values) => handleColumnFilterChange('booking_date', values)}
                        availableDates={okOverviews
                          .filter(ok => ok.first_booking)
                          .map(ok => new Date(ok.first_booking!))
                        }
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="title"
                        label="Titel"
                        options={getColumnOptions('title')}
                        selectedValues={filters.columnFilters.title}
                        onFilterChange={handleColumnFilterChange}
                        type="text"
                        placeholder="Titel..."
                        align="center"
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="konto_nr"
                        label="Konto"
                        options={getColumnOptions('konto_nr')}
                        selectedValues={filters.columnFilters.konto_nr}
                        onFilterChange={handleColumnFilterChange}
                        type="select"
                        align="center"
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="ok_nr"
                        label="OK"
                        options={getColumnOptions('ok_nr')}
                        selectedValues={filters.columnFilters.ok_nr}
                        onFilterChange={handleColumnFilterChange}
                        type="select"
                        align="center"
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="budget_total"
                        label="Budget"
                        options={getColumnOptions('budget_total')}
                        selectedValues={filters.columnFilters.budget_total}
                        onFilterChange={handleColumnFilterChange}
                        type="select"
                        align="center"
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="spent"
                        label="Verbraucht"
                        options={getColumnOptions('spent')}
                        selectedValues={filters.columnFilters.spent}
                        onFilterChange={handleColumnFilterChange}
                        type="select"
                        align="center"
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="available"
                        label="Verfügbar"
                        options={getColumnOptions('available')}
                        selectedValues={filters.columnFilters.available}
                        onFilterChange={handleColumnFilterChange}
                        type="select"
                        align="center"
                      />
                    </th>
                    <th className="px-0 py-0 text-center">
                      <ColumnFilter
                        column="status"
                        label="Status"
                        options={['healthy', 'warning', 'critical']}
                        selectedValues={filters.columnFilters.status}
                        onFilterChange={handleColumnFilterChange}
                        type="select"
                        align="center"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupData.map((ok, index) => {
                    const budgetStatus = getBudgetStatus(ok.available, ok.budget_total)
                    return (
                      <tr 
                        key={ok.ok_id} 
                        className="transition-colors duration-200 border-b dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <td className="px-4 py-2 text-center text-black dark:text-white">
                          {ok.first_booking 
                            ? new Date(ok.first_booking).toLocaleDateString('de-CH', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-2 text-left text-black dark:text-white">
                          <div className="max-w-xs truncate" title={ok.title}>
                            {ok.title}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center cursor-pointer" onClick={() => handleColumnFilterChange('konto_nr', [ok.konto_nr])} title={`Alle OKs für Konto ${ok.konto_nr} anzeigen`}>
                          <span className="text-primary-600 dark:text-primary-400">
                            {ok.konto_nr}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center cursor-pointer" onClick={() => handleColumnFilterChange('ok_nr', [ok.ok_nr])} title={`${ok.ok_nr}: ${ok.title}`}>
                          <span className="text-primary-600 dark:text-primary-400">
                            {ok.ok_nr}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-white">
                          {formatCurrency(ok.budget_total)}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-white">
                          {formatCurrency(ok.spent)}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-white">
                          {formatCurrency(ok.available)}
                        </td>
                        <td className="px-4 py-2 text-center text-black dark:text-white">
                          <div className="flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              budgetStatus.status === 'healthy' ? 'bg-green-500' :
                              budgetStatus.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                            }`}></div>
                            <span>
                              {Math.round((Math.abs(ok.spent || 0) / (ok.budget_total || 1)) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}