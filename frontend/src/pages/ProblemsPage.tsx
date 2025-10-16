import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FileText, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { generateProblems } from '@/lib/api'
import { ProblemItem } from '@/lib/types'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

export default function ProblemsPage() {
  const [level, setLevel] = useState<'basic' | 'intermediate' | 'advanced'>('basic')
  const [topic, setTopic] = useState<'macro' | 'finance' | 'trade' | 'stats'>('macro')
  const [count, setCount] = useState(5)
  const [style, setStyle] = useState<'mcq' | 'free'>('mcq')
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      generateProblems({
        level,
        topic,
        count,
        style,
      }),
    onSuccess: (response) => {
      setProblems(response.data.items)
      setExpandedIdx(null)
    },
  })

  const handleGenerate = () => {
    mutation.mutate()
  }

  const handleExportCSV = () => {
    if (problems.length === 0) return

    const headers = ['문제', '정답', '해설']
    if (style === 'mcq') headers.splice(1, 0, '보기')

    const rows = problems.map((p) => {
      const row = [
        `"${p.question.replace(/"/g, '""')}"`,
        style === 'mcq' ? `"${p.options?.join(' | ') || ''}"` : '',
        `"${p.answer.replace(/"/g, '""')}"`,
        `"${p.explain.replace(/"/g, '""')}"`,
      ]
      return row.filter((v) => v !== '').join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `경제문제_${new Date().getTime()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-tight font-bold mb-2">경제 문제 생성</h1>
        <p className="text-slate">AI가 맞춤형 경제 문제를 생성합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gold" />
                문제 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-2">
                  난이도
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'basic', label: '초급' },
                    { value: 'intermediate', label: '중급' },
                    { value: 'advanced', label: '고급' },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={level === opt.value ? 'default' : 'outline'}
                      onClick={() => setLevel(opt.value as any)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-2">
                  주제
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'macro', label: '거시경제' },
                    { value: 'finance', label: '금융' },
                    { value: 'trade', label: '무역' },
                    { value: 'stats', label: '통계' },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={topic === opt.value ? 'default' : 'outline'}
                      onClick={() => setTopic(opt.value as any)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-2">
                  형식
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={style === 'mcq' ? 'default' : 'outline'}
                    onClick={() => setStyle('mcq')}
                  >
                    객관식
                  </Button>
                  <Button
                    size="sm"
                    variant={style === 'free' ? 'default' : 'outline'}
                    onClick={() => setStyle('free')}
                  >
                    서술형
                  </Button>
                </div>
              </div>

              {/* Count */}
              <div>
                <label className="block text-sm font-medium text-slate-light mb-2">
                  문제 수: {count}개
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? '생성 중...' : '문제 만들기'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-4">
          {mutation.isPending && <LoadingSpinner text="문제를 생성하고 있습니다..." />}

          {mutation.error && (
            <ErrorDisplay
              message={mutation.error.message}
              onRetry={handleGenerate}
            />
          )}

          {problems.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-tight font-semibold">
                  생성된 문제 ({problems.length}개)
                </h2>
                <Button size="sm" variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV로 내보내기
                </Button>
              </div>

              <div className="space-y-3">
                {problems.map((problem, idx) => (
                  <Card key={idx} className="hover:border-gold/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary">문제 {idx + 1}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setExpandedIdx(expandedIdx === idx ? null : idx)
                          }
                        >
                          {expandedIdx === idx ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <p className="text-white font-medium mb-3">
                        {problem.question}
                      </p>

                      {style === 'mcq' && problem.options && (
                        <div className="space-y-1.5 mb-3">
                          {problem.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className="px-3 py-2 rounded bg-noir-bg text-sm text-slate-light"
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}

                      {expandedIdx === idx && (
                        <div className="pt-3 border-t border-noir-border space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gold mb-1">
                              정답
                            </p>
                            <p className="text-sm text-white">{problem.answer}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gold mb-1">
                              해설
                            </p>
                            <p className="text-sm text-slate-light">
                              {problem.explain}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!mutation.isPending && !mutation.error && problems.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-slate-dark mx-auto mb-4" />
                <p className="text-slate">
                  설정을 선택하고 "문제 만들기"를 클릭하세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

