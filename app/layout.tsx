import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { FontSizeSwitcher } from '@/components/FontSizeSwitcher'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { Github } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'Zürcher Verkehrsverbund (ZVV) | KontoRadar | v0.1',
  description: 'Intelligentes Dashboard für Objektkredite und Budgetverbrauch im Zürcher Verkehrsverbund',
  keywords: 'ZVV, Budget, Objektkredite, ÖV, Verkehr, Zürich, Dashboard',
  authors: [{ name: 'Zürcher Verkehrsverbund' }],
  openGraph: {
    title: 'Zürcher Verkehrsverbund (ZVV) | KontoRadar | v0.1',
    description: 'Intelligentes Dashboard für Objektkredite und Budgetverbrauch',
    url: 'https://kontoradar.zvv.dev',
    siteName: 'ZVV KontoRadar',
    locale: 'de_CH',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 dark:bg-gray-900">
            {/* Kompakter Header - Full Width */}
            <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                      <img 
                        src="/zvv-logo.svg" 
                        alt="ZVV Logo" 
                        className="h-10 w-auto dark:invert"
                      />
                      <h1 className="text-xl font-normal text-black dark:text-white flex items-center gap-2">
                        <span>KontoRadar</span>
                        <span className="text-gray-400 dark:text-gray-500">|</span>
                        <span className="text-sm text-orange-600 dark:text-orange-400">v0.1</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Testdaten
                        </span>
                      </h1>
                    </Link>
                  </div>
                  
                  <nav className="flex items-center gap-3">
                    <a 
                      href="https://github.com/zvvch/zvv-kontoradar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors no-print"
                      title="GitHub Repository"
                    >
                      <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </a>
                    <FontSizeSwitcher />
                    <ThemeSwitcher />
                  </nav>
                </div>
              </div>
            </header>
            
            {/* Full-Screen Content Area */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full w-full">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>
          <PerformanceMonitor />
        </ThemeProvider>
      </body>
    </html>
  )
}