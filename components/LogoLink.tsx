'use client'

import Link from 'next/link'

export function LogoLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.location.href = '/'
  }

  return (
    <Link 
      href="/" 
      className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      <img 
        src="/zvv-logo.svg" 
        alt="ZVV Logo" 
        className="h-8 sm:h-10 w-auto dark:invert"
      />
      <h1 className="text-lg sm:text-xl font-normal text-black dark:text-white flex items-center gap-1.5 sm:gap-2">
        <span>KontoRadar 💸</span>
        <span className="hidden sm:inline text-gray-400 dark:text-gray-500">|</span>
        <span className="hidden sm:inline text-sm text-orange-600 dark:text-orange-400">v0.1</span>
        <span 
          className="hidden md:inline text-xs text-gray-500 dark:text-gray-400 cursor-help border-b border-dashed border-gray-400 dark:border-gray-500"
          title="Dies sind fiktive, frei erfundene Testdaten, welche in keinem Verhältnis zur Geschäftstätigkeit des ZVV stehen"
        >
          Testdaten
        </span>
      </h1>
    </Link>
  )
}

