import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { FontSizeSwitcher } from '@/components/FontSizeSwitcher'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'ZVV KontoRadar',
  description: 'Intelligentes Dashboard für Objektkredite und Budgetverbrauch im Zürcher Verkehrsverbund',
  keywords: 'ZVV, Budget, Objektkredite, ÖV, Verkehr, Zürich, Dashboard',
  authors: [{ name: 'Zürcher Verkehrsverbund' }],
  openGraph: {
    title: 'ZVV KontoRadar',
    description: 'Intelligentes Dashboard für Objektkredite und Budgetverbrauch',
    url: 'https://kontoradar.zvv.dev',
    siteName: 'KontoRadar',
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
                    <div className="flex items-center space-x-3">
                      <img 
                        src="/zvv-logo.svg" 
                        alt="ZVV Logo" 
                        className="h-10 w-auto dark:invert"
                      />
                      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-black dark:text-white">
            Kontoradar
          </h1>
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
            v0.1 Alpha
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Testdaten
          </span>
        </div>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex items-center gap-3">
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