'use client'

import BottomNav from '@/app/components/BottomNav'

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">ปฏิทิน</h1>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">เร็วๆ นี้</h2>
        <p className="text-gray-600 mb-2">ฟีเจอร์ปฏิทินและกิจกรรม</p>
        <p className="text-gray-400 text-sm">Calendar, Events, Tasks, Routines</p>
      </div>

      <BottomNav />
    </div>
  )
}
