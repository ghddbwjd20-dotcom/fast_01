export interface KPIData {
  cpi: number
  cpi_change: number
  gdp_qoq: number
  gdp_yoy: number
  unemployment: number
  unemployment_change: number
  base_rate: number
  base_rate_change: number
  usdkrw: number
  usdkrw_change: number
  spx: number
  spx_change: number
  kospi: number
  kospi_change: number
  updated_at: string
}

export interface TimeSeriesPoint {
  date: string
  value: number
}

export interface TrendsData {
  cpi_series: TimeSeriesPoint[]
  unemployment_series: TimeSeriesPoint[]
  rate_series: TimeSeriesPoint[]
  gdp_series: TimeSeriesPoint[]
}

export interface NewsItem {
  title: string
  summary: string
  url: string
  source: string
  published_at: string
}

export interface ProblemItem {
  question: string
  options?: string[]
  answer: string
  explain: string
}

export interface RecommendItem {
  title: string
  summary: string
  url: string
  tags: string[]
}

