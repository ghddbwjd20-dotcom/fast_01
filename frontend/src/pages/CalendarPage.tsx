import { useQuery } from '@tanstack/react-query'
import { Calendar, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import { api } from '@/lib/api'
import { formatNumber } from '@/lib/utils'

interface CalendarEvent {
  datetime: string
  indicator: string
  actual?: number
  consensus?: number
  previous?: number
  surprise?: number
  importance: string
  source: string
  source_url?: string
}

export default function CalendarPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['calendar'],
    queryFn: async () => (await api.get('/market/calendar')).data,
  })

  const events: CalendarEvent[] = data?.events || []

  return (
    <div className="max-w-7xl mx-auto space-y-6 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-tight font-bold mb-2">경제지표 캘린더</h1>
        <p className="text-slate">다음 주 주요 발표 일정과 서프라이즈</p>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gold" />
            다음 주 주요 발표
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading && <LoadingSpinner text="캘린더를 불러오는 중..." />}

          {error && (
            <ErrorDisplay
              message="캘린더를 불러오는 데 실패했습니다."
              onRetry={refetch}
            />
          )}

          {!isLoading && !error && events.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-noir-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-light">
                      일시
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-light">
                      지표
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-light">
                      실제
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-light">
                      예측
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-light">
                      이전
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-light">
                      서프라이즈
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-light">
                      출처
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => {
                    const hasSurprise = event.surprise !== null && event.surprise !== undefined
                    const isPositiveSurprise = hasSurprise && event.surprise! > 0
                    const isNegativeSurprise = hasSurprise && event.surprise! < 0

                    return (
                      <tr
                        key={idx}
                        className="border-b border-noir-border hover:bg-noir-bg transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="text-sm text-white">
                            {new Date(event.datetime).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">
                              {event.indicator}
                            </span>
                            {event.importance === 'high' && (
                              <AlertTriangle className="h-3.5 w-3.5 text-gold" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {event.actual !== null && event.actual !== undefined ? (
                            <span className="text-sm font-semibold text-white">
                              {formatNumber(event.actual, 2)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-dark">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-light">
                            {event.consensus !== null && event.consensus !== undefined
                              ? formatNumber(event.consensus, 2)
                              : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate">
                            {event.previous !== null && event.previous !== undefined
                              ? formatNumber(event.previous, 2)
                              : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {hasSurprise ? (
                            <div className="flex items-center justify-end space-x-1">
                              {isPositiveSurprise && (
                                <>
                                  <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                                  <span className="text-sm font-semibold text-green-400">
                                    +{formatNumber(event.surprise!, 2)}
                                  </span>
                                </>
                              )}
                              {isNegativeSurprise && (
                                <>
                                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                                  <span className="text-sm font-semibold text-red-400">
                                    {formatNumber(event.surprise!, 2)}
                                  </span>
                                </>
                              )}
                              {!isPositiveSurprise && !isNegativeSurprise && (
                                <span className="text-sm text-slate">0.0</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-dark">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {event.source}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-dark mx-auto mb-4" />
              <p className="text-slate">예정된 발표가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-gold" />
                <span className="text-slate">= 높은 중요도</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-slate">= 예상보다 높음</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-slate">= 예상보다 낮음</span>
              </div>
            </div>
            <span className="text-slate-dark text-xs">
              서프라이즈 = 실제 - 예측
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

