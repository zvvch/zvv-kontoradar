'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, X, Check, Filter, SortAsc, SortDesc } from 'lucide-react'

interface DateFilterProps {
  selectedValues: string[]
  onFilterChange: (values: string[]) => void
  availableDates: Date[]
  sortable?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: () => void
}

export function DateFilter({ selectedValues, onFilterChange, availableDates, sortable = false, sortBy, sortOrder, onSort }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'year' | 'month'>('year')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Schließe Dropdown bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generiere verfügbare Jahre
  const availableYears = Array.from(new Set(
    availableDates.map(date => date.getFullYear())
  )).sort((a, b) => b - a) // Neueste zuerst

  // Generiere verfügbare Monate (Monat + Jahr, aber jeder Monat nur einmal pro Jahr)
  const selectedYears = selectedValues.filter(v => /^\d{4}$/.test(v))
  const availableMonths = Array.from(new Set(
    availableDates.map(date => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const label = date.toLocaleDateString('de-CH', { year: 'numeric', month: 'long' })
      return { year, month, label }
    })
  )).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  const handleYearToggle = (year: string) => {
    const newValues = selectedValues.includes(year)
      ? selectedValues.filter(v => v !== year)
      : [...selectedValues, year]
    
    // Entferne alle Monate des Jahres wenn Jahr entfernt wird
    if (!selectedValues.includes(year)) {
      const monthsToRemove = availableMonths
        .filter(m => m.year.toString() === year)
        .map(m => m.label)
      newValues.splice(0, newValues.length, ...newValues.filter(v => !monthsToRemove.includes(v)))
    }
    
    onFilterChange(newValues)
  }

  const handleMonthToggle = (monthLabel: string) => {
    const newValues = selectedValues.includes(monthLabel)
      ? selectedValues.filter(v => v !== monthLabel)
      : [...selectedValues, monthLabel]
    
    onFilterChange(newValues)
  }

  const handleSelectAllYears = () => {
    const allYears = availableYears.map(y => y.toString())
    onFilterChange(allYears)
  }

  const handleSelectAllMonths = () => {
    const allMonths = availableMonths.map(m => m.label)
    onFilterChange(allMonths)
  }

  const handleClearAll = () => {
    onFilterChange([])
  }

  const hasActiveFilters = selectedValues.length > 0

  return (
    <div 
      ref={dropdownRef}
      className="relative flex items-center justify-center h-full"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`group cursor-pointer flex items-center space-x-2 font-semibold text-sm transition-all duration-200 px-4 py-3.5 h-full justify-center ${
          hasActiveFilters 
            ? 'text-primary-600' 
            : 'text-gray-800 dark:text-gray-200'
        } hover:bg-primary-600 hover:text-white`}
      >
        <span className="group-hover:text-white">Datum</span>
        {hasActiveFilters && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
        <Filter className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
      </div>
      
      {/* Sort Button */}
      {sortable && onSort && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSort()
          }}
          className="px-2 py-3.5 hover:bg-primary-600 group transition-colors"
          title="Sortieren"
        >
          {sortBy === 'first_booking' && sortOrder === 'asc' && (
            <SortAsc className="h-3.5 w-3.5 text-primary-600 group-hover:text-white" />
          )}
          {sortBy === 'first_booking' && sortOrder === 'desc' && (
            <SortDesc className="h-3.5 w-3.5 text-primary-600 group-hover:text-white" />
          )}
          {sortBy !== 'first_booking' && (
            <SortAsc className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-50" />
          )}
        </button>
      )}

      {/* Filter Dialog */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Datum filtern
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('year')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'year'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Nach Jahr
              </button>
              <button
                onClick={() => setActiveTab('month')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === 'month'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Nach Monat
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'year' ? (
              <div className="space-y-3">
                {/* Year Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllYears}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Alle auswählen
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Alle entfernen
                  </button>
                </div>

                {/* Year List */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableYears.map(year => {
                    const isSelected = selectedValues.includes(year.toString())
                    return (
                      <label
                        key={year}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {year}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Month Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllMonths}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Alle auswählen
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Alle entfernen
                  </button>
                </div>

                {/* Month List */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableMonths.map(month => {
                    const isSelected = selectedValues.includes(month.label)
                    return (
                      <label
                        key={`${month.year}-${month.month}`}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {month.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedValues.length} ausgewählt
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              >
                Anwenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
