'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, Filter } from 'lucide-react'

interface ColumnFilterProps {
  column: string
  label: string
  options: string[]
  selectedValues: string[]
  onFilterChange: (column: string, values: string[]) => void
  type?: 'text' | 'select'
  placeholder?: string
  align?: 'left' | 'right' | 'center'
}

export function ColumnFilter({
  column,
  label,
  options,
  selectedValues,
  onFilterChange,
  type = 'select',
  placeholder = 'Filter...',
  align = 'left'
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [textValue, setTextValue] = useState(selectedValues[0] || '')
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

  if (type === 'text') {
    return (
      <div 
        ref={dropdownRef}
        onClick={() => setIsOpen(!isOpen)}
      className={`group cursor-pointer flex items-center space-x-2 font-semibold text-sm transition-all duration-200 px-4 py-3.5 h-full ${alignmentClass} ${
        hasActiveFilters 
          ? 'text-primary-600' 
          : 'text-gray-800 dark:text-gray-200'
      } hover:bg-primary-600 hover:text-white`}
    >
      <span className="group-hover:text-white">{label}</span>
        {hasActiveFilters && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
            1
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
        <Filter className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />


        {/* Text-Filter Dialog */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3"
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
      onClick={() => setIsOpen(!isOpen)}
      className={`group cursor-pointer flex items-center space-x-2 font-semibold text-sm transition-all duration-200 px-4 py-3.5 h-full ${alignmentClass} ${
        hasActiveFilters 
          ? 'text-primary-600' 
          : 'text-gray-800 dark:text-gray-200'
      } hover:bg-primary-600 hover:text-white`}
    >
      <span className="group-hover:text-white">{label}</span>
      {hasActiveFilters && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
          {selectedValues.length}
        </span>
      )}
      <ChevronDown className={`h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
      <Filter className="h-3.5 w-3.5 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />


      {/* Dropdown-Filter Dialog */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Suchfeld */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suchen..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Alle auswählen
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Zurücksetzen
            </button>
          </div>

          {/* Optionen */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 truncate">{option}</span>
                </label>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Keine Optionen gefunden
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-600">
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
