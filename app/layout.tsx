import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { LogoLink } from '@/components/LogoLink'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'ZVV | KontoRadar 💸',
  description: 'Echtzeit-Überwachung von Objektkrediten und Budgetverbrauch beim Zürcher Verkehrsverbund. Intelligente Burn-Down Charts, Filter-Funktionen und detaillierte Auswertungen für effizientes Finanzcontrolling.',
  keywords: 'ZVV, Budget, Objektkredite, ÖV, Verkehr, Zürich, Dashboard, Finanzcontrolling, Burn-Down Chart',
  authors: [{ name: 'Zürcher Verkehrsverbund' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'ZVV | KontoRadar 💸',
    description: 'Echtzeit-Überwachung von Objektkrediten und Budgetverbrauch beim Zürcher Verkehrsverbund. Intelligente Burn-Down Charts, Filter-Funktionen und detaillierte Auswertungen für effizientes Finanzcontrolling.',
    url: 'https://kontoradar.zvv.dev',
    siteName: 'ZVV KontoRadar',
    locale: 'de_CH',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZVV KontoRadar Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZVV | KontoRadar 💸',
    description: 'Echtzeit-Überwachung von Objektkrediten und Budgetverbrauch beim Zürcher Verkehrsverbund. Intelligente Burn-Down Charts und detaillierte Auswertungen.',
    images: ['/og-image.png'],
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
                <div className="flex justify-center items-center py-3">
                  <LogoLink />
                </div>
              </div>
            </header>
            
            {/* Full-Screen Content Area */}
            <main className="flex-1 overflow-hidden sm:overflow-auto">
              <div className="h-full sm:min-h-full flex flex-col">
                <div className="flex-1 overflow-hidden sm:overflow-visible">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
                
                {/* Footer */}
                <Footer />
              </div>
            </main>
          </div>
          <PerformanceMonitor />
        </ThemeProvider>
      </body>
    </html>
  )
}