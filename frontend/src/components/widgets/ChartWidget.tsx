import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Star, FileDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

interface ChartWidgetProps {
  widget: any
  onBookmark?: (id: string) => void
  onAddToReport?: (id: string) => void
}

export default function ChartWidget({ widget, onBookmark, onAddToReport }: ChartWidgetProps) {
  const { id, spec, data, title, source } = widget
  const chartType = spec?.chart_type || 'line'
  const series = spec?.series || []
  const y2Axis = spec?.y2_axis || []
  const annotations = spec?.annotations || []

  // 데이터 변환
  const chartData: any[] = []
  if (data && Object.keys(data).length > 0) {
    const firstSeries = Object.values(data)[0] as any[]
    firstSeries.forEach((point, idx) => {
      const row: any = { date: point.date }
      Object.keys(data).forEach(seriesName => {
        row[seriesName] = (data as any)[seriesName][idx]?.value
      })
      chartData.push(row)
    })
  }

  const renderChart = () => {
    const ChartComponent = chartType === 'area' ? AreaChart : chartType === 'bar' ? BarChart : LineChart

    return (
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2225" />
          <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" stroke="#64748B" style={{ fontSize: '12px' }} />
          {y2Axis.length > 0 && (
            <YAxis yAxisId="right" orientation="right" stroke="#64748B" style={{ fontSize: '12px' }} />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#121416',
              border: '1px solid #1F2225',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#94A3B8' }}
          />
          <Legend />
          
          {/* Annotations */}
          {annotations.map((ann: any, idx: number) => (
            ann.type === 'horizontal_line' && (
              <ReferenceLine
                key={idx}
                y={ann.y}
                yAxisId="left"
                stroke={ann.color || '#C8A96A'}
                strokeDasharray="3 3"
                label={{ value: ann.label, fill: ann.color || '#C8A96A', fontSize: 12 }}
              />
            )
          ))}
          
          {/* Series */}
          {series.map((seriesName: string, idx: number) => {
            const isY2 = y2Axis.includes(seriesName)
            const color = idx === 0 ? '#C8A96A' : idx === 1 ? '#4ade80' : '#60a5fa'
            
            if (chartType === 'area') {
              return (
                <Area
                  key={seriesName}
                  type="monotone"
                  dataKey={seriesName}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  yAxisId={isY2 ? 'right' : 'left'}
                />
              )
            } else if (chartType === 'bar') {
              return (
                <Bar
                  key={seriesName}
                  dataKey={seriesName}
                  fill={color}
                  yAxisId={isY2 ? 'right' : 'left'}
                />
              )
            } else {
              return (
                <Line
                  key={seriesName}
                  type="monotone"
                  dataKey={seriesName}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  yAxisId={isY2 ? 'right' : 'left'}
                />
              )
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className="hover:border-gold/30 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{title || '차트'}</CardTitle>
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
        {chartData.length > 0 ? renderChart() : (
          <div className="h-64 flex items-center justify-center text-slate">
            데이터가 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  )
}

