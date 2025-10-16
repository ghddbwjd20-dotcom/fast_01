import { ArrowUp, ArrowDown, Info } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { cn, formatNumber, formatPct } from '@/lib/utils'
import Badge from './ui/Badge'
import Sparkline from './Sparkline'
import { useState } from 'react'
import MetricExplainModal from './MetricExplainModal'

interface KPIDetail {
  value: number
  mom?: number
  yoy?: number
  sparkline: Array<{ date: string; value: number }>
  source: string
  updated_at: string
}

interface EnhancedKpiCardProps {
  title: string
  metricKey: string
  data: KPIDetail
  unit?: string
  decimals?: number
  isPercentage?: boolean
}

export default function EnhancedKpiCard({
  title,
  metricKey,
  data,
  unit = '',
  decimals = 2,
  isPercentage = false,
}: EnhancedKpiCardProps) {
  const [showExplain, setShowExplain] = useState(false)
  
  const change = data.yoy || data.mom || 0
  const isPositive = change > 0
  const isNegative = change < 0

  const formattedValue = isPercentage
    ? `${formatNumber(data.value, decimals)}%`
    : `${formatNumber(data.value, decimals)}${unit}`

  return (
    <>
      <Card className="relative overflow-hidden hover:border-gold/30 transition-all group">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-slate-light">{title}</h3>
                <button
                  onClick={() => setShowExplain(true)}
                  className="text-slate-dark hover:text-gold transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {data.source}
            </Badge>
          </div>

          {/* Value */}
          <div className="text-3xl font-tight font-bold text-white tracking-tight mb-2">
            {formattedValue}
          </div>

          {/* Change */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isPositive && (
                <>
                  <ArrowUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    {formatPct(change, decimals)}
                  </span>
                </>
              )}
              {isNegative && (
                <>
                  <ArrowDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    {formatPct(change, decimals)}
                  </span>
                </>
              )}
              {!isPositive && !isNegative && (
                <span className="text-sm text-slate">변동 없음</span>
              )}
              <span className="text-xs text-slate-dark">
                {data.yoy ? '전년 대비' : '전월 대비'}
              </span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="h-10 -mx-2">
            <Sparkline
              data={data.sparkline}
              color={isPositive ? '#4ade80' : isNegative ? '#f87171' : '#C8A96A'}
              height={40}
            />
          </div>

          {/* Update time */}
          <div className="mt-2 text-xs text-slate-dark">
            업데이트: {new Date(data.updated_at).toLocaleString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Hover effect */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'
            )}
          />
        </CardContent>
      </Card>

      {/* Explain Modal */}
      {showExplain && (
        <MetricExplainModal
          metric={metricKey}
          onClose={() => setShowExplain(false)}
        />
      )}
    </>
  )
}

