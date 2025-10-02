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
      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      <img 
        src="/zvv-logo.svg" 
        alt="ZVV Logo" 
        className="h-10 w-auto dark:invert"
      />
      <h1 className="text-xl font-normal text-black dark:text-white flex items-center gap-2">
        <span>KontoRadar 💸</span>
        <span className="text-gray-400 dark:text-gray-500">|</span>
        <span className="text-sm text-orange-600 dark:text-orange-400">v0.1</span>
        <span 
          className="text-xs text-gray-500 dark:text-gray-400 cursor-help border-b border-dashed border-gray-400 dark:border-gray-500"
          title="Dies sind fiktive, frei erfundene Testdaten, welche in keinem Verhältnis zur Geschäftstätigkeit des ZVV stehen"
        >
          Testdaten
        </span>
      </h1>
    </Link>
  )
}

