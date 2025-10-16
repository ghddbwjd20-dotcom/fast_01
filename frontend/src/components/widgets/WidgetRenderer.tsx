import ChartWidget from './ChartWidget'
import TableWidget from './TableWidget'
import CardWidget from './CardWidget'

interface Widget {
  id: string
  type: 'chart' | 'table' | 'card'
  [key: string]: any
}

interface WidgetRendererProps {
  widget: Widget
  onBookmark?: (widgetId: string) => void
  onAddToReport?: (widgetId: string) => void
}

export default function WidgetRenderer({
  widget,
  onBookmark,
  onAddToReport,
}: WidgetRendererProps) {
  switch (widget.type) {
    case 'chart':
      return (
        <ChartWidget
          widget={widget}
          onBookmark={onBookmark}
          onAddToReport={onAddToReport}
        />
      )
    case 'table':
      return (
        <TableWidget
          widget={widget}
          onBookmark={onBookmark}
          onAddToReport={onAddToReport}
        />
      )
    case 'card':
      return (
        <CardWidget
          widget={widget}
          onBookmark={onBookmark}
          onAddToReport={onAddToReport}
        />
      )
    default:
      return (
        <div className="p-4 border border-red-500/20 rounded-lg">
          <p className="text-red-400">알 수 없는 위젯 타입: {widget.type}</p>
        </div>
      )
  }
}

