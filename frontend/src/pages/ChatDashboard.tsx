import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import WidgetRenderer from '@/components/widgets/WidgetRenderer'
import LoadingSpinner from '@/components/LoadingSpinner'
import Badge from '@/components/ui/Badge'

const SAMPLE_PROMPTS = [
  "2019년부터 지금까지 CPI와 기준금리 비교 차트 보여줘",
  "금리가 25bp 인상되면 어떤 영향이 있을까?",
  "이번 주 주요 경제 발표 일정 알려줘",
  "코어 CPI가 뭐야? 초보자도 알기 쉽게 설명해줘",
]

export default function ChatDashboard() {
  const [message, setMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [widgets, setWidgets] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const chatMutation = useMutation({
    mutationFn: async (msg: string) => {
      return await api.post('/chat', {
        session_id: sessionId,
        message: msg,
      })
    },
    onSuccess: (response) => {
      const data = response.data
      
      // 세션 ID 저장
      if (data.session_id) {
        setSessionId(data.session_id)
      }
      
      // 메시지 추가
      const assistantMessages = data.messages.filter(
        (m: any) => m.role === 'assistant' && m.content
      )
      if (assistantMessages.length > 0) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          ...assistantMessages
        ])
      }
      
      // 위젯 추가
      if (data.widgets && data.widgets.length > 0) {
        setWidgets(prev => [...prev, ...data.widgets])
      }
      
      // 제안 업데이트
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
      
      // 입력 초기화
      setMessage('')
    },
  })

  const handleSend = () => {
    if (!message.trim() || chatMutation.isPending) return
    chatMutation.mutate(message)
  }

  const handleSampleClick = (prompt: string) => {
    setMessage(prompt)
    chatMutation.mutate(prompt)
  }

  const handleBookmark = (widgetId: string) => {
    console.log('Bookmark:', widgetId)
    // TODO: 북마크 API 호출
  }

  const handleAddToReport = (widgetId: string) => {
    console.log('Add to report:', widgetId)
    // TODO: 리포트 추가 API 호출
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-tight font-bold mb-2 flex items-center">
          <Sparkles className="h-8 w-8 text-gold mr-3" />
          경제 분석 코파일럿
        </h1>
        <p className="text-slate">
          질문하면 AI가 데이터를 조회하고 차트와 분석을 제공합니다
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4">
        {/* Left: Conversation */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>대화</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {messages.length === 0 && !chatMutation.isPending && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="h-16 w-16 text-gold mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    무엇을 도와드릴까요?
                  </h3>
                  <p className="text-slate mb-6">
                    경제 지표, 차트, 계산, 일정 등 무엇이든 물어보세요
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
                    {SAMPLE_PROMPTS.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSampleClick(prompt)}
                        className="text-left justify-start h-auto py-3 px-4"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.role === 'user'
                      ? 'bg-gold/10 border-gold/20'
                      : 'bg-noir-bg border-noir-border'
                  } p-4 rounded-lg border`}
                >
                  <div className="text-xs text-slate-dark mb-2">
                    {msg.role === 'user' ? '사용자' : 'AI 분석가'}
                  </div>
                  <div className="text-white whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner text="AI가 분석 중입니다..." />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Input */}
          <div className="mt-4">
            <div className="flex space-x-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="질문을 입력하세요... (Shift+Enter로 줄바꿈)"
                rows={3}
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || chatMutation.isPending}
                size="lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-slate-dark">추천 질문:</span>
                {suggestions.map((sug, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMessage(sug)
                      chatMutation.mutate(sug)
                    }}
                    disabled={chatMutation.isPending}
                  >
                    {sug}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Widgets */}
        <div className="lg:w-1/2 overflow-y-auto">
          <div className="space-y-4">
            {widgets.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  생성된 위젯 ({widgets.length})
                </h3>
                <Badge variant="outline">실시간 업데이트</Badge>
              </div>
            )}

            {widgets.map((widget) => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                onBookmark={handleBookmark}
                onAddToReport={handleAddToReport}
              />
            ))}

            {widgets.length === 0 && messages.length > 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate">
                    위젯이 생성되면 여기에 표시됩니다
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

