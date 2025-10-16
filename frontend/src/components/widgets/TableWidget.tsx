import { Star, FileDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

interface TableWidgetProps {
  widget: any
  onBookmark?: (id: string) => void
  onAddToReport?: (id: string) => void
}

export default function TableWidget({ widget, onBookmark, onAddToReport }: TableWidgetProps) {
  const { id, columns, rows, title, source } = widget

  return (
    <Card className="hover:border-gold/30 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{title || '표'}</CardTitle>
            {source && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {source}
              </Badge>
            )}
          </div>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-noir-border">
                {columns?.map((col: string, idx: number) => (
                  <th key={idx} className="text-left py-3 px-4 text-sm font-semibold text-slate-light">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows?.map((row: any, rowIdx: number) => (
                <tr key={rowIdx} className="border-b border-noir-border hover:bg-noir-bg transition-colors">
                  {columns?.map((col: string, colIdx: number) => (
                    <td key={colIdx} className="py-3 px-4 text-sm text-white">
                      {row[col] !== undefined ? row[col] : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

