"""고급 데이터 모델"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ===== KPI with Sparkline =====
class SparklinePoint(BaseModel):
    date: str
    value: float


class KPIDetail(BaseModel):
    value: float
    mom: Optional[float] = None  # Month over Month
    yoy: Optional[float] = None  # Year over Year
    sparkline: List[SparklinePoint] = []
    source: str = "Mock"
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ExtendedKPIData(BaseModel):
    # 필수 지표
    cpi: KPIDetail
    core_cpi: KPIDetail
    policy_rate: KPIDetail
    unemployment: KPIDetail
    gdp_growth: KPIDetail
    usdkrw: KPIDetail
    kospi: KPIDetail
    spx: KPIDetail
    
    # 추가 지표
    pmi_manufacturing: Optional[KPIDetail] = None
    retail_sales: Optional[KPIDetail] = None


# ===== Economic Calendar =====
class CalendarEvent(BaseModel):
    datetime: str
    indicator: str
    actual: Optional[float] = None
    consensus: Optional[float] = None
    previous: Optional[float] = None
    surprise: Optional[float] = None  # actual - consensus
    importance: str = "medium"  # low, medium, high
    source: str
    source_url: Optional[str] = None


class CalendarResponse(BaseModel):
    events: List[CalendarEvent]
    period: str = "upcoming_week"


# ===== AI Chart Request =====
class AIChartRequest(BaseModel):
    query: str = Field(..., max_length=500)
    date_range: Optional[str] = None


class AIChartResponse(BaseModel):
    chart_type: str  # "line", "bar", "combo", etc.
    title: str
    data_keys: List[str]
    time_range: str
    chart_config: dict
    explanation: str


# ===== AI Explain Request =====
class AIExplainRequest(BaseModel):
    metric: str
    level: str = "easy"  # easy, intermediate, advanced


class AIExplainResponse(BaseModel):
    metric: str
    definition: str
    why_matters: str
    typical_reaction: str
    current_value: Optional[str] = None
    interpretation_tip: Optional[str] = None


# ===== What-if Scenario =====
class WhatIfRequest(BaseModel):
    scenario: str = Field(..., max_length=200)
    parameters: dict = {}


class WhatIfResponse(BaseModel):
    scenario: str
    scenarios: List[dict]  # 3가지 시나리오
    assumptions: List[str]
    disclaimer: str


# ===== Market Tickers =====
class TickerData(BaseModel):
    symbol: str
    name: str
    last: float
    change_1d_pct: float
    change_1w_pct: Optional[float] = None
    change_1m_pct: Optional[float] = None
    range_52w_low: Optional[float] = None
    range_52w_high: Optional[float] = None
    sparkline_7d: List[float] = []
    source: str = "Mock"
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TickersResponse(BaseModel):
    tickers: List[TickerData]
    category: str  # "forex", "indices", "commodities", "bonds"

