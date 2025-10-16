import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: Array<{ date: string; value: number }>
  color?: string
  height?: number
}

export default function Sparkline({ data, color = '#C8A96A', height = 40 }: SparklineProps) {
  if (!data || data.length === 0) {
    return <div className="h-10 w-24 bg-noir-border/20 rounded animate-pulse" />
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

