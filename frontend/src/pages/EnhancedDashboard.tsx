import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import EnhancedKpiCard from '@/components/EnhancedKpiCard'
import MarketTickers from '@/components/MarketTickers'
import ChartCard from '@/components/ChartCard'
import NewsCard from '@/components/NewsCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Skeleton from '@/components/ui/Skeleton'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function EnhancedDashboard() {
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
    refetch: refetchKpis,
  } = useQuery({
    queryKey: ['extended-kpis'],
    queryFn: async () => (await api.get('/market/kpis/extended')).data,
  })

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['trends'],
    queryFn: async () => (await api.get('/market/trends')).data,
  })

  const {
    data: news,
    isLoading: newsLoading,
    error: newsError,
    refetch: refetchNews,
  } = useQuery({
    queryKey: ['news'],
    queryFn: async () => (await api.get('/market/news')).data,
  })

  return (
    <div className="space-y-6 animation-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-tight font-bold mb-2">고급 경제 대시보드</h1>
        <p className="text-slate">실시간 경제 지표와 AI 분석</p>
      </div>

      {/* Market Tickers */}
      <div>
        <h2 className="text-xl font-tight font-semibold mb-4">실시간 마켓</h2>
        <MarketTickers />
      </div>

      {/* Enhanced KPI Cards */}
      <div>
        <h2 className="text-xl font-tight font-semibold mb-4">주요 경제 지표</h2>
        {kpisError ? (
          <ErrorDisplay
            message="지표 데이터를 불러오지 못했습니다."
            onRetry={refetchKpis}
            compact
          />
        ) : kpisLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <EnhancedKpiCard
              title="소비자물가지수"
              metricKey="cpi"
              data={kpis.cpi}
              isPercentage
            />
            <EnhancedKpiCard
              title="근원 CPI"
              metricKey="core_cpi"
              data={kpis.core_cpi}
              isPercentage
            />
            <EnhancedKpiCard
              title="기준금리"
              metricKey="policy_rate"
              data={kpis.policy_rate}
              unit="%"
            />
            <EnhancedKpiCard
              title="실업률"
              metricKey="unemployment"
              data={kpis.unemployment}
              unit="%"
            />
            <EnhancedKpiCard
              title="GDP 성장률"
              metricKey="gdp_growth"
              data={kpis.gdp_growth}
              unit="%"
            />
            <EnhancedKpiCard
              title="USD/KRW"
              metricKey="usdkrw"
              data={kpis.usdkrw}
              unit="원"
            />
            <EnhancedKpiCard
              title="KOSPI"
              metricKey="kospi"
              data={kpis.kospi}
              decimals={2}
            />
            <EnhancedKpiCard
              title="S&P 500"
              metricKey="spx"
              data={kpis.spx}
              decimals={2}
            />
            {kpis.pmi_manufacturing && (
              <EnhancedKpiCard
                title="제조업 PMI"
                metricKey="pmi_manufacturing"
                data={kpis.pmi_manufacturing}
                decimals={1}
              />
            )}
            {kpis.retail_sales && (
              <EnhancedKpiCard
                title="소매판매"
                metricKey="retail_sales"
                data={kpis.retail_sales}
                unit="%"
              />
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPI Trend */}
        <ChartCard
          title="인플레이션 트렌드"
          description="최근 36개월"
          source="통계청"
        >
          {trendsError ? (
            <ErrorDisplay
              message="차트 데이터를 불러오지 못했습니다."
              onRetry={refetchTrends}
              compact
            />
          ) : trendsLoading ? (
            <Skeleton className="h-80" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trends.cpi_series}>
                <defs>
                  <linearGradient id="colorCpi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A96A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8A96A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2225" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121416',
                    border: '1px solid #1F2225',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C8A96A"
                  fill="url(#colorCpi)"
                  strokeWidth={2}
                  name="CPI"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Rate vs Unemployment */}
        <ChartCard
          title="금리 & GDP 성장률"
          description="최근 36개월"
          source="한국은행"
        >
          {trendsError ? (
            <ErrorDisplay
              message="차트 데이터를 불러오지 못했습니다."
              onRetry={refetchTrends}
              compact
            />
          ) : trendsLoading ? (
            <Skeleton className="h-80" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trends.rate_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2225" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121416',
                    border: '1px solid #1F2225',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#C8A96A"
                  strokeWidth={2}
                  name="기준금리"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* News */}
      <div>
        <h2 className="text-xl font-tight font-semibold mb-4">경제 뉴스</h2>
        {newsError ? (
          <ErrorDisplay
            message="뉴스를 불러오지 못했습니다."
            onRetry={refetchNews}
            compact
          />
        ) : newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.items.map((item: any, idx: number) => (
              <NewsCard
                key={idx}
                news={item}
                onClick={() => window.open(item.url, '_blank')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

