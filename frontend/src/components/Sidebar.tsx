import { Link, useLocation } from 'react-router-dom'
import { Home, MessageSquare, FileText, BookOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '요약/Q&A', href: '/qa', icon: MessageSquare },
  { name: '문제 생성', href: '/problems', icon: FileText },
  { name: '자료 추천', href: '/recommend', icon: BookOpen },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-noir-card border-r border-noir-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-noir-border">
        <TrendingUp className="h-6 w-6 text-gold mr-3" />
        <h1 className="text-lg font-tight font-bold text-white tracking-tight">
          Noir Luxe
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                isActive
                  ? 'bg-gold text-noir-bg'
                  : 'text-slate-light hover:bg-noir-bg hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-noir-border">
        <p className="text-xs text-slate-dark text-center">
          © 2024 Noir Luxe Economy
        </p>
      </div>
    </div>
  )
}

