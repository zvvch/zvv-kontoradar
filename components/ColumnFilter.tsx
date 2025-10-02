'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, Filter, SortAsc, SortDesc } from 'lucide-react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-[10000] pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ColumnFilterProps {
  column: string
  label: string
  options: string[]
  selectedValues: string[]
  onFilterChange: (column: string, values: string[]) => void
  type?: 'text' | 'select'
  placeholder?: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

export function ColumnFilter({
  column,
  label,
  options,
  selectedValues,
  onFilterChange,
  type = 'select',
  placeholder = 'Filter...',
  align = 'left',
  sortable = false,
  sortBy,
  sortOrder,
  onSort
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [textValue, setTextValue] = useState(selectedValues[0] || '')
  const [dropdownPosition, setDropdownPosition] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  // Prüfe Position und öffne nach oben oder unten
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = 450
      const dropdownWidth = type === 'text' ? 256 : 288
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      let left = rect.left
      // Stelle sicher, dass das Dropdown nicht über den rechten Rand hinausgeht
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10
      }
      
      // Öffne nach oben oder unten
      if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
        setDropdownPosition({ bottom: window.innerHeight - rect.top + 8, left })
      } else {
        setDropdownPosition({ top: rect.bottom + 8, left })
      }
    }
  }, [isOpen, type])

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

  // Filtere Optionen basierend auf Suchbegriff
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option]
    
    onFilterChange(column, newValues)
  }

  const handleSelectAll = () => {
    onFilterChange(column, filteredOptions)
  }

  const handleClearAll = () => {
    onFilterChange(column, [])
    setSearchTerm('')
    setTextValue('')
  }

  const handleTextChange = (value: string) => {
    setTextValue(value)
    onFilterChange(column, value ? [value] : [])
  }

  const hasActiveFilters = type === 'text' ? textValue : selectedValues.length > 0

  const alignmentClass = 
    align === 'right' ? 'justify-end' :
    align === 'center' ? 'justify-center' :
    'justify-start'

  // Erstelle Tooltip-Text für aktive Filter
  const getTooltipText = () => {
    if (!hasActiveFilters) return `${label} filtern`
    if (type === 'text') return `Aktiver Filter: "${selectedValues[0]}"`
    if (selectedValues.length === 1) return `Aktiver Filter: ${selectedValues[0]}`
    return `${selectedValues.length} Filter aktiv: ${selectedValues.slice(0, 3).join(', ')}${selectedValues.length > 3 ? '...' : ''}`
  }

  if (type === 'text') {
    return (
      <div 
        ref={dropdownRef}
        className="relative flex items-center justify-center h-full"
      >
        <Tooltip text={getTooltipText()}>
          <div 
            ref={buttonRef}
            className={`group cursor-pointer flex items-center space-x-2 font-semibold text-sm transition-all duration-200 px-4 py-3.5 h-full ${alignmentClass} ${
              hasActiveFilters 
                ? 'text-primary-600' 
                : 'text-gray-800 dark:text-gray-200'
            } hover:bg-primary-600 hover:text-white`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="group-hover:text-white">{label}</span>
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                1
              </span>
            )}
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
            <Filter className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </div>
        </Tooltip>
        
        {/* Sort Button */}
        {sortable && onSort && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSort(column)
            }}
            className="px-2 py-3.5 hover:bg-primary-600 group transition-colors"
            title="Sortieren"
          >
            {sortBy === column && sortOrder === 'asc' && (
              <SortAsc className="h-3.5 w-3.5 text-primary-600 group-hover:text-white" />
            )}
            {sortBy === column && sortOrder === 'desc' && (
              <SortDesc className="h-3.5 w-3.5 text-primary-600 group-hover:text-white" />
            )}
            {sortBy !== column && (
              <SortAsc className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-50" />
            )}
          </button>
        )}


        {/* Text-Filter Dialog */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="fixed w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] p-3"
            style={{
              top: dropdownPosition.top !== undefined ? `${dropdownPosition.top}px` : 'auto',
              bottom: dropdownPosition.bottom !== undefined ? `${dropdownPosition.bottom}px` : 'auto',
              left: `${dropdownPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                {label} filtern
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={textValue}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  autoFocus
                />
                {textValue && (
                  <button
                    onClick={() => handleTextChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-1.5 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              >
                Anwenden
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={dropdownRef}
      className="relative flex items-center justify-center h-full"
    >
      <Tooltip text={getTooltipText()}>
        <div 
          ref={buttonRef}
          className={`group cursor-pointer flex items-center space-x-2 font-semibold text-sm transition-all duration-200 px-4 py-3.5 h-full ${alignmentClass} ${
            hasActiveFilters 
              ? 'text-primary-600' 
              : 'text-gray-800 dark:text-gray-200'
          } hover:bg-primary-600 hover:text-white`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="group-hover:text-white">{label}</span>
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
          <Filter className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
        </div>
      </Tooltip>
      
      {/* Sort Button */}
      {sortable && onSort && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSort(column)
          }}
          className="px-2 py-3.5 hover:bg-primary-600 group transition-colors"
          title="Sortieren"
        >
          {sortBy === column && sortOrder === 'asc' && (
            <SortAsc className="h-3.5 w-3.5 text-primary-600 group-hover:text-white" />
          )}
          {sortBy === column && sortOrder === 'desc' && (
            <SortDesc className="h-3.5 w-3.5 text-primary-600 group-hover:text-white" />
          )}
          {sortBy !== column && (
            <SortAsc className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-50" />
          )}
        </button>
      )}


      {/* Dropdown-Filter Dialog */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] overflow-hidden"
          style={{
            top: dropdownPosition.top !== undefined ? `${dropdownPosition.top}px` : 'auto',
            bottom: dropdownPosition.bottom !== undefined ? `${dropdownPosition.bottom}px` : 'auto',
            left: `${dropdownPosition.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Suchfeld */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suchen..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
            >
              Alle auswählen
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              Zurücksetzen
            </button>
          </div>

          {/* Optionen */}
          <div className="max-h-80 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{option}</span>
                </label>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Keine Optionen gefunden
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {selectedValues.length} von {options.length} ausgewählt
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
