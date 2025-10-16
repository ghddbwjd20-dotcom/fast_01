import { Star, FileDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface CardWidgetProps {
  widget: any
  onBookmark?: (id: string) => void
  onAddToReport?: (id: string) => void
}

export default function CardWidget({ widget, onBookmark, onAddToReport }: CardWidgetProps) {
  const { id, title, body_md, footer, variant = 'default' } = widget

  const variantClasses = {
    default: 'border-noir-border',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-red-500/30 bg-red-500/5',
  }

  return (
    <Card className={cn('hover:border-gold/30 transition-all', variantClasses[variant as keyof typeof variantClasses])}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {onBookmark && (
              <Button size="sm" variant="ghost" onClick={() => onBookmark(id)}>
                <Star className="h-4 w-4" />
              </Button>
            )}
            {onAddToReport && (
              <Button size="sm" variant="ghost" onClick={() => onAddToReport(id)}>
                <FileDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-3 text-slate-light">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
              li: ({ children }) => <li className="text-slate-light">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
            }}
          >
            {body_md}
          </ReactMarkdown>
        </div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-noir-border text-xs text-slate-dark">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

