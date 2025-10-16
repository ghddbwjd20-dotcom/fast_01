import { useQuery } from '@tanstack/react-query'
import { X, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import Button from './ui/Button'
import LoadingSpinner from './LoadingSpinner'
import { api } from '@/lib/api'

interface MetricExplainModalProps {
  metric: string
  onClose: () => void
}

export default function MetricExplainModal({ metric, onClose }: MetricExplainModalProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metric-explain', metric],
    queryFn: async () => {
      const response = await api.post('/ai/explain', {
        metric,
        level: 'easy'
      })
      return response.data
    },
  })

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {data?.metric || metric}
              </CardTitle>
              <p className="text-sm text-slate mt-1">경제 지표 설명</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && <LoadingSpinner text="설명을 불러오는 중..." />}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400">설명을 불러오는 데 실패했습니다.</p>
            </div>
          )}

          {data && (
            <>
              {/* Definition */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  <h3 className="text-lg font-semibold text-white">정의</h3>
                </div>
                <p className="text-slate-light leading-relaxed">
                  {data.definition}
                </p>
              </div>

              {/* Why it matters */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-gold" />
                  <h3 className="text-lg font-semibold text-white">왜 중요한가?</h3>
                </div>
                <p className="text-slate-light leading-relaxed">
                  {data.why_matters}
                </p>
              </div>

              {/* Typical reaction */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-gold" />
                  <h3 className="text-lg font-semibold text-white">일반적 시장 반응</h3>
                </div>
                <p className="text-slate-light leading-relaxed">
                  {data.typical_reaction}
                </p>
              </div>

              {/* Current value */}
              {data.current_value && (
                <div className="p-4 rounded-lg bg-gold/10 border border-gold/20">
                  <p className="text-sm font-medium text-gold mb-1">현재 수치</p>
                  <p className="text-white">{data.current_value}</p>
                </div>
              )}

              {/* Interpretation tip */}
              {data.interpretation_tip && (
                <div className="p-4 rounded-lg bg-noir-bg border border-noir-border">
                  <p className="text-sm font-medium text-slate-light mb-1">해석 팁</p>
                  <p className="text-sm text-slate">{data.interpretation_tip}</p>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t border-noir-border">
            <Button onClick={onClose} className="w-full">
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

