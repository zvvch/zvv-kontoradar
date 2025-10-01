'use client'

import { Suspense } from 'react'
import { SmartDashboard } from '@/components/SmartDashboard'

function DashboardContent() {
  return <SmartDashboard />
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
