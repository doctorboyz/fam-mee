'use client'

import Link from 'next/link'

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-8">Calendar and events features will be available here</p>
        <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block">
          Back to Dashboard
        </Link>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex justify-around">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-600 hover:text-indigo-600">
              <span className="text-2xl">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>
            
            <Link href="/wallet" className="flex flex-col items-center gap-1 text-gray-600 hover:text-indigo-600">
              <span className="text-2xl">💰</span>
              <span className="text-xs font-medium">Wallet</span>
            </Link>
            
            <Link href="/transactions" className="flex flex-col items-center gap-1 text-gray-600 hover:text-indigo-600">
              <span className="text-2xl">📝</span>
              <span className="text-xs font-medium">Transactions</span>
            </Link>
            
            <button className="flex flex-col items-center gap-1 text-indigo-600">
              <span className="text-2xl">📅</span>
              <span className="text-xs font-medium">Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
