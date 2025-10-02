'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OKOverview, AccountOverview, Booking, getBudgetStatus } from '@/lib/types'
import { useResolvedTheme } from '@/lib/theme'
import { ColumnFilter } from '@/components/ColumnFilter'
import { DateFilter } from '@/components/DateFilter'
import { BurnDownChartECharts } from '@/components/BurnDownChartECharts'
import { BookingsTreemap } from '@/components/BookingsTreemap'
import { 
  Search, Filter, SortAsc, SortDesc, Eye, Download, 
  TrendingUp, AlertTriangle, CheckCircle,
  Calendar, DollarSign, Building2, Users, Target,
  ChevronDown, X, Save, RefreshCw, Settings,
  BarChart3, PieChart, Activity, Zap, FileText
} from 'lucide-react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-[10000] pointer-events-none max-w-xs">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [currentView, setCurrentView] = useState<string>('default')
  const [selectedBurnDownYear, setSelectedBurnDownYear] = useState<number>(new Date().getFullYear())
  const [bookingSortBy, setBookingSortBy] = useState<string>('booking_date')
  const [bookingSortOrder, setBookingSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const theme = useResolvedTheme()

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: { start: '', end: '' },
    budgetRange: { min: 0, max: 1000000 },
    status: [],
    accounts: [],
    oks: [],
    sortBy: 'first_booking',
    sortOrder: 'desc',
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

  // Prüfe ob ein einzelnes OK gefiltert ist
  const isOkFiltered = filters.columnFilters.ok_nr.length === 1

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

  // Sortier-Funktion
  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
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
      let aVal: any
      let bVal: any
      
      // Spezialbehandlung für Status
      if (filters.sortBy === 'status') {
        const aStatus = getBudgetStatus(a.available, a.budget_total).status
        const bStatus = getBudgetStatus(b.available, b.budget_total).status
        const statusOrder = { 'critical': 0, 'warning': 1, 'healthy': 2 }
        aVal = statusOrder[aStatus as keyof typeof statusOrder]
        bVal = statusOrder[bStatus as keyof typeof statusOrder]
      } else if (filters.sortBy === 'first_booking' || filters.sortBy === 'last_booking') {
        // Spezialbehandlung für Datumsfelder
        aVal = a[filters.sortBy] ? new Date(a[filters.sortBy] as string).getTime() : 0
        bVal = b[filters.sortBy] ? new Date(b[filters.sortBy] as string).getTime() : 0
      } else {
        aVal = a[filters.sortBy as keyof OKOverview]
        bVal = b[filters.sortBy as keyof OKOverview]
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }
      
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [okOverviews, filters])

  // Sortier-Funktion für Buchungen
  const handleBookingSort = (column: string) => {
    if (bookingSortBy === column) {
      setBookingSortOrder(bookingSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setBookingSortBy(column)
      setBookingSortOrder('desc')
    }
  }

  // Gefilterte Buchungen für Buchungsansicht
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    // Filter nach OK
    if (filters.columnFilters.ok_nr.length > 0) {
      const selectedOKs = okOverviews
        .filter(ok => filters.columnFilters.ok_nr.includes(ok.ok_nr))
        .map(ok => ok.ok_id)
      filtered = filtered.filter(b => selectedOKs.includes(b.ok_id))
    }

    // Filter nach Konto
    if (filters.columnFilters.konto_nr.length > 0) {
      const selectedAccounts = okOverviews
        .filter(ok => filters.columnFilters.konto_nr.includes(ok.konto_nr))
        .map(ok => ok.account_id)
      filtered = filtered.filter(b => selectedAccounts.includes(b.account_id))
    }

    // Filter nach Datum
    if (filters.columnFilters.booking_date.length > 0) {
      filtered = filtered.filter(b => {
        const date = new Date(b.booking_date)
        const year = date.getFullYear().toString()
        const monthYear = date.toLocaleDateString('de-CH', { year: 'numeric', month: 'long' })
        return filters.columnFilters.booking_date.includes(year) || 
               filters.columnFilters.booking_date.includes(monthYear)
      })
    }

    // Sortierung
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any
      
      switch (bookingSortBy) {
        case 'booking_date':
          aVal = new Date(a.booking_date).getTime()
          bVal = new Date(b.booking_date).getTime()
          break
        case 'beleg_nr':
          aVal = a.beleg_nr || ''
          bVal = b.beleg_nr || ''
          break
        case 'text_long':
          aVal = (a.text_long || '').toLowerCase()
          bVal = (b.text_long || '').toLowerCase()
          break
        case 'gegenkonto':
          aVal = a.gegenkonto || ''
          bVal = b.gegenkonto || ''
          break
        case 'amount':
          aVal = Math.abs(a.amount)
          bVal = Math.abs(b.amount)
          break
        default:
          aVal = new Date(a.booking_date).getTime()
          bVal = new Date(b.booking_date).getTime()
      }
      
      if (bookingSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [bookings, okOverviews, filters.columnFilters, bookingSortBy, bookingSortOrder])

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

  // Prüfe ob Buchungen angezeigt werden sollen (bei genau 1 OK)
  const shouldShowBookings = useMemo(() => {
    return filters.columnFilters.ok_nr.length === 1
  }, [filters.columnFilters.ok_nr])


  // Extrahiere verfügbare Jahre aus den Buchungen
  const availableYears = useMemo(() => {
    if (filteredBookings.length === 0) return []
    
    const years = new Set(
      filteredBookings.map(b => new Date(b.booking_date).getFullYear())
    )
    return Array.from(years).sort((a, b) => b - a) // Neueste zuerst
  }, [filteredBookings])

  // Setze Jahr automatisch wenn sich die Buchungen ändern
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedBurnDownYear)) {
      setSelectedBurnDownYear(availableYears[0])
    }
  }, [availableYears, selectedBurnDownYear])

  // Generiere Burn-Down Daten für gefilterte OKs
  const burnDownData = useMemo(() => {
    // Nur anzeigen wenn genau 1 OK gefiltert ist
    if (filteredBookings.length === 0 || !shouldShowBookings) return []

    const selectedOK = filteredData[0]
    if (!selectedOK) return []

    // Filtere Buchungen nach ausgewähltem Jahr
    const yearBookings = filteredBookings.filter(
      b => new Date(b.booking_date).getFullYear() === selectedBurnDownYear
    )

    // Sortiere Buchungen nach Datum
    const sortedBookings = [...yearBookings].sort(
      (a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
    )

    if (sortedBookings.length === 0) return []

    const dataPoints: any[] = []
    let cumulativeSpent = 0

    // Bestimme Start- und Enddatum für Ideallinie
    const firstDate = new Date(sortedBookings[0].booking_date)
    const lastDate = new Date(sortedBookings[sortedBookings.length - 1].booking_date)
    
    // Wenn Projekt noch läuft, nutze Jahresende als Enddatum
    const yearEnd = new Date(selectedBurnDownYear, 11, 31)
    const projectEnd = lastDate < yearEnd ? yearEnd : lastDate
    const projectDuration = projectEnd.getTime() - firstDate.getTime()
    
    // Startpunkt: Voller Budget am ersten Buchungsdatum
    dataPoints.push({
      date: firstDate.toISOString().split('T')[0],
      budget: selectedOK.budget_total,
      spent: 0,
      available: selectedOK.budget_total,
      remaining: selectedOK.budget_total,
      idealRemaining: selectedOK.budget_total,
      percentage: 0
    })

    // Erstelle einen Datenpunkt für jede Buchung
    sortedBookings.forEach((booking, index) => {
      cumulativeSpent += Math.abs(booking.amount)
      const available = Math.max(0, selectedOK.budget_total - cumulativeSpent)
      
      // Berechne ideale Restbudget basierend auf linearem Verlauf vom ersten bis letzten Buchungsdatum
      const bookingDate = new Date(booking.booking_date)
      const elapsed = bookingDate.getTime() - firstDate.getTime()
      const progress = projectDuration > 0 ? elapsed / projectDuration : 0
      const idealRemaining = Math.max(0, selectedOK.budget_total * (1 - progress))

      dataPoints.push({
        date: booking.booking_date,
        budget: selectedOK.budget_total,
        spent: cumulativeSpent,
        available: available,
        remaining: available,
        idealRemaining: idealRemaining,
        percentage: (cumulativeSpent / selectedOK.budget_total) * 100
      })
    })

    return [{ ok: selectedOK, data: dataPoints }]
  }, [filteredBookings, filteredData, shouldShowBookings, selectedBurnDownYear])

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

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // PDF Export Funktion
  const handlePrintPDF = () => {
    window.print()
  }

  // Berechne globale KPIs (MUSS VOR allen return statements stehen!)
  const globalKPIs = useMemo(() => {
    const totalBudget = filteredData.reduce((sum, ok) => sum + (ok.budget_total || 0), 0)
    const totalSpent = filteredData.reduce((sum, ok) => sum + Math.abs(ok.spent || 0), 0)
    const totalAvailable = filteredData.reduce((sum, ok) => sum + (ok.available || 0), 0)
    const avgUtilization = filteredData.length > 0
      ? filteredData.reduce((sum, ok) => {
          const util = ok.budget_total > 0 ? (Math.abs(ok.spent) / ok.budget_total) * 100 : 0
          return sum + util
        }, 0) / filteredData.length
      : 0

    return { totalBudget, totalSpent, totalAvailable, avgUtilization, okCount: filteredData.length }
  }, [filteredData])

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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">

      {/* Globale KPI-Karten */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Gesamtbudget */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-600">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Gesamtbudget</p>
                <p className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400 truncate">
                  <span className="sm:hidden">{formatCurrencyCompact(globalKPIs.totalBudget)}</span>
                  <span className="hidden sm:inline">CHF {formatCurrencyCompact(globalKPIs.totalBudget)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Verbraucht */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-600">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Verbraucht</p>
                <p className="text-sm sm:text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
                  <span className="sm:hidden">{formatCurrencyCompact(globalKPIs.totalSpent)}</span>
                  <span className="hidden sm:inline">CHF {formatCurrencyCompact(globalKPIs.totalSpent)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Verfügbar */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-600">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Verfügbar</p>
                <p className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400 truncate">
                  <span className="sm:hidden">{formatCurrencyCompact(globalKPIs.totalAvailable)}</span>
                  <span className="hidden sm:inline">CHF {formatCurrencyCompact(globalKPIs.totalAvailable)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Durchschnittliche Auslastung */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-600">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Ø Auslastung</p>
                <p className={`text-sm sm:text-lg font-bold ${
                  globalKPIs.avgUtilization < 75 ? 'text-green-600 dark:text-green-400' :
                  globalKPIs.avgUtilization < 90 ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                } truncate`}>
                  {globalKPIs.avgUtilization.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Anzahl OKs */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-600">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">Anzahl OKs</p>
                <p className="text-sm sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {globalKPIs.okCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter-Bereich */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
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

          {/* PDF Export Button - nur sichtbar wenn genau 1 OK gefiltert ist */}
          {shouldShowBookings && (
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 no-print"
              title="Als PDF exportieren"
            >
              <FileText className="h-4 w-4" />
              PDF Export
            </button>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabellen */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* OK-Übersicht Tabelle (immer sichtbar, fixe kompakte Höhe) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'} ${shouldShowBookings ? 'max-h-32' : ''} overflow-y-auto scrollbar-thin`}>
              <table className="w-full text-sm border-collapse" id="ok-table">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10 shadow-sm border-b border-gray-300 dark:border-gray-600">
                  <tr>
                    {!isOkFiltered && (
                      <>
                        <th className="px-0 py-0 text-center">
                          <DateFilter
                            selectedValues={filters.columnFilters.booking_date}
                            onFilterChange={(values) => handleColumnFilterChange('booking_date', values)}
                            availableDates={okOverviews
                              .filter(ok => ok.first_booking)
                              .map(ok => new Date(ok.first_booking!))
                            }
                            sortable={true}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onSort={() => handleSort('first_booking')}
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
                            sortable={true}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onSort={handleSort}
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
                            sortable={true}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onSort={handleSort}
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
                            sortable={true}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onSort={handleSort}
                          />
                        </th>
                      </>
                    )}
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleSort('budget_total')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Budget</span>
                        {filters.sortBy === 'budget_total' && (
                          filters.sortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleSort('spent')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Verbraucht</span>
                        {filters.sortBy === 'spent' && (
                          filters.sortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleSort('available')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Verfügbar</span>
                        {filters.sortBy === 'available' && (
                          filters.sortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Status</span>
                        {filters.sortBy === 'status' && (
                          filters.sortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((ok) => {
                    const budgetStatus = getBudgetStatus(ok.available, ok.budget_total)
                    return (
                      <tr 
                        key={ok.ok_id} 
                        className="transition-colors duration-200 border-b dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {!isOkFiltered && (
                          <>
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
                            <td 
                              className="px-4 py-2 text-center cursor-pointer" 
                              onClick={() => window.location.href = `/konto/${ok.konto_nr}`} 
                              title={`Konto ${ok.konto_nr} Details anzeigen`}
                            >
                              <span className="text-primary-600 dark:text-primary-400 hover:underline">
                                {ok.konto_nr}
                              </span>
                            </td>
                            <td 
                              className="px-4 py-2 text-center cursor-pointer" 
                              onClick={() => window.location.href = `/ok/${ok.ok_id}`}
                            >
                              <Tooltip text={`${ok.ok_nr} - ${ok.title} | Konto: ${ok.account_name}`}>
                                <span className="text-primary-600 dark:text-primary-400 hover:underline">
                                  {ok.ok_nr}
                                </span>
                              </Tooltip>
                            </td>
                          </>
                        )}
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

        {/* Buchungs-Detail Tabelle (nur sichtbar wenn genau 1 OK gefiltert) */}
        {shouldShowBookings && filteredBookings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10 shadow-sm border-b border-gray-300 dark:border-gray-600">
                  <tr>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleBookingSort('booking_date')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Datum</span>
                        {bookingSortBy === 'booking_date' && (
                          bookingSortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleBookingSort('beleg_nr')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Beleg</span>
                        {bookingSortBy === 'beleg_nr' && (
                          bookingSortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleBookingSort('text_long')}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Text</span>
                        {bookingSortBy === 'text_long' && (
                          bookingSortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleBookingSort('gegenkonto')}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Gegenkonto</span>
                        {bookingSortBy === 'gegenkonto' && (
                          bookingSortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right cursor-pointer group hover:bg-primary-600 transition-colors"
                      onClick={() => handleBookingSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-white">
                        <span>Betrag</span>
                        {bookingSortBy === 'amount' && (
                          bookingSortOrder === 'asc' ? 
                            <SortAsc className="h-3.5 w-3.5" /> : 
                            <SortDesc className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      className="transition-colors duration-200 border-b dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-2 text-center text-black dark:text-white">
                        {new Date(booking.booking_date).toLocaleDateString('de-CH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-2 text-center text-black dark:text-white">
                        {booking.beleg_nr}
                      </td>
                      <td className="px-4 py-2 text-left text-black dark:text-white">
                        <div className="max-w-md truncate" title={booking.text_long || undefined}>
                          {booking.text_long}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-black dark:text-white">
                        {booking.gegenkonto}
                      </td>
                      <td className="px-4 py-2 text-right text-black dark:text-white">
                        {formatCurrency(booking.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>

    </div>
  )
}