'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/wallet', label: 'Wallet', icon: '💰' },
  { href: '/transactions', label: 'Transactions', icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-600 scale-105'
                    : 'text-gray-500 hover:text-indigo-500 active:scale-95'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
