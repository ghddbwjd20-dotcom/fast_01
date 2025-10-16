import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { cn, formatNumber, formatPct } from '@/lib/utils'
import Sparkline from './Sparkline'
import Skeleton from './ui/Skeleton'
import { api } from '@/lib/api'

interface Ticker {
  symbol: string
  name: string
  last: number
  change_1d_pct: number
  sparkline_7d: number[]
  source: string
}

export default function MarketTickers() {
  const { data, isLoading } = useQuery({
    queryKey: ['tickers'],
    queryFn: async () => (await api.get('/market/tickers')).data,
    refetchInterval: 30000, // 30초마다 갱신
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  const tickers: Ticker[] = data?.tickers || []

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {tickers.map((ticker) => {
        const isPositive = ticker.change_1d_pct > 0
        const isNegative = ticker.change_1d_pct < 0

        return (
          <Card
            key={ticker.symbol}
            className="hover:border-gold/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-3">
              {/* Symbol */}
              <div className="text-xs font-medium text-slate-dark mb-1">
                {ticker.symbol}
              </div>

              {/* Name */}
              <div className="text-sm font-semibold text-white mb-1 truncate group-hover:text-gold transition-colors">
                {ticker.name}
              </div>

              {/* Value */}
              <div className="text-lg font-tight font-bold text-white mb-1">
                {formatNumber(ticker.last, ticker.last > 1000 ? 2 : 2)}
              </div>

              {/* Change */}
              <div className="flex items-center space-x-1 mb-2">
                {isPositive && (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs font-medium text-green-400">
                      {formatPct(ticker.change_1d_pct, 2)}
                    </span>
                  </>
                )}
                {isNegative && (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-400" />
                    <span className="text-xs font-medium text-red-400">
                      {formatPct(ticker.change_1d_pct, 2)}
                    </span>
                  </>
                )}
                {!isPositive && !isNegative && (
                  <span className="text-xs text-slate">0.00%</span>
                )}
              </div>

              {/* Sparkline */}
              <div className="h-8 -mx-1">
                <Sparkline
                  data={ticker.sparkline_7d.map((value, idx) => ({
                    date: `D-${7 - idx}`,
                    value,
                  }))}
                  color={isPositive ? '#4ade80' : isNegative ? '#f87171' : '#C8A96A'}
                  height={32}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

