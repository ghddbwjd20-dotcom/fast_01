"""고급 시장 데이터 어댑터"""
from datetime import datetime, timedelta
from typing import List
import random
from app.models.advanced import (
    KPIDetail, SparklinePoint, ExtendedKPIData,
    CalendarEvent, CalendarResponse,
    TickerData, TickersResponse
)


def generate_sparkline(base_value: float, months: int = 12) -> List[SparklinePoint]:
    """스파크라인 데이터 생성"""
    sparkline = []
    current_date = datetime.now()
    
    for i in range(months):
        date = current_date - timedelta(days=30 * (months - i - 1))
        # 약간의 변동성 추가
        value = base_value + random.uniform(-base_value * 0.1, base_value * 0.1)
        sparkline.append(SparklinePoint(
            date=date.strftime("%Y-%m"),
            value=round(value, 2)
        ))
    
    return sparkline


def generate_extended_kpis() -> ExtendedKPIData:
    """확장된 KPI 데이터 생성"""
    return ExtendedKPIData(
        cpi=KPIDetail(
            value=110.5,
            mom=0.3,
            yoy=2.3,
            sparkline=generate_sparkline(110.0, 12),
            source="통계청",
        ),
        core_cpi=KPIDetail(
            value=108.2,
            mom=0.2,
            yoy=2.0,
            sparkline=generate_sparkline(108.0, 12),
            source="통계청",
        ),
        policy_rate=KPIDetail(
            value=3.50,
            mom=0.0,
            yoy=0.75,
            sparkline=generate_sparkline(3.5, 12),
            source="한국은행",
        ),
        unemployment=KPIDetail(
            value=3.4,
            mom=-0.1,
            yoy=-0.3,
            sparkline=generate_sparkline(3.4, 12),
            source="통계청",
        ),
        gdp_growth=KPIDetail(
            value=2.2,
            mom=0.6,  # QoQ
            yoy=2.2,
            sparkline=generate_sparkline(2.2, 12),
            source="한국은행",
        ),
        usdkrw=KPIDetail(
            value=1335.50,
            mom=5.20,
            yoy=45.30,
            sparkline=generate_sparkline(1335, 12),
            source="서울외환중개",
        ),
        kospi=KPIDetail(
            value=2655.20,
            mom=1.12,
            yoy=8.45,
            sparkline=generate_sparkline(2655, 12),
            source="한국거래소",
        ),
        spx=KPIDetail(
            value=4783.45,
            mom=0.85,
            yoy=15.23,
            sparkline=generate_sparkline(4783, 12),
            source="S&P",
        ),
        pmi_manufacturing=KPIDetail(
            value=51.2,
            mom=0.5,
            yoy=2.1,
            sparkline=generate_sparkline(51, 12),
            source="S&P Global",
        ),
        retail_sales=KPIDetail(
            value=3.8,
            mom=0.4,
            yoy=3.8,
            sparkline=generate_sparkline(3.8, 12),
            source="통계청",
        ),
    )


def generate_calendar_events() -> CalendarResponse:
    """경제 지표 캘린더 생성"""
    now = datetime.now()
    events = []
    
    # 다음 주 이벤트들
    indicators = [
        ("CPI (YoY)", 2.3, 2.4, 2.5, "high", "통계청"),
        ("실업률", 3.4, 3.5, 3.5, "medium", "통계청"),
        ("소매판매 (YoY)", 3.8, 3.5, 3.2, "medium", "통계청"),
        ("무역수지 (억$)", 42.5, 38.0, 35.2, "high", "관세청"),
        ("산업생산 (YoY)", 2.1, 2.3, 2.8, "medium", "통계청"),
        ("기준금리 결정", 3.50, 3.50, 3.50, "high", "한국은행"),
    ]
    
    for i, (indicator, actual, consensus, previous, importance, source) in enumerate(indicators):
        event_date = now + timedelta(days=i + 1)
        surprise = actual - consensus if actual and consensus else None
        
        events.append(CalendarEvent(
            datetime=event_date.strftime("%Y-%m-%d %H:%M"),
            indicator=indicator,
            actual=actual if random.random() > 0.5 else None,  # 50% 이미 발표됨
            consensus=consensus,
            previous=previous,
            surprise=surprise,
            importance=importance,
            source=source,
            source_url=f"https://example.com/{indicator.replace(' ', '_')}"
        ))
    
    return CalendarResponse(
        events=events,
        period="upcoming_week"
    )


def generate_market_tickers() -> TickersResponse:
    """마켓 티커 데이터 생성"""
    tickers = [
        TickerData(
            symbol="USD/KRW",
            name="달러/원",
            last=1335.50,
            change_1d_pct=0.39,
            change_1w_pct=1.12,
            change_1m_pct=2.35,
            range_52w_low=1250.00,
            range_52w_high=1380.00,
            sparkline_7d=[1328, 1330, 1332, 1329, 1333, 1336, 1335.5],
            source="서울외환중개",
        ),
        TickerData(
            symbol="JPY/KRW",
            name="엔/원 (100엔)",
            last=898.20,
            change_1d_pct=-0.15,
            change_1w_pct=-0.82,
            change_1m_pct=-2.14,
            sparkline_7d=[902, 900, 901, 899, 897, 898, 898.2],
            source="서울외환중개",
        ),
        TickerData(
            symbol="KOSPI",
            name="코스피",
            last=2655.20,
            change_1d_pct=1.12,
            change_1w_pct=2.35,
            change_1m_pct=5.67,
            range_52w_low=2300.00,
            range_52w_high=2750.00,
            sparkline_7d=[2610, 2625, 2640, 2630, 2645, 2650, 2655],
            source="한국거래소",
        ),
        TickerData(
            symbol="SPX",
            name="S&P 500",
            last=4783.45,
            change_1d_pct=0.85,
            change_1w_pct=1.67,
            change_1m_pct=4.23,
            range_52w_low=4100.00,
            range_52w_high=4850.00,
            sparkline_7d=[4720, 4735, 4750, 4745, 4765, 4775, 4783],
            source="S&P Global",
        ),
        TickerData(
            symbol="GOLD",
            name="금 (온스)",
            last=2045.30,
            change_1d_pct=-0.23,
            change_1w_pct=1.45,
            change_1m_pct=3.89,
            sparkline_7d=[2020, 2025, 2035, 2040, 2042, 2048, 2045],
            source="COMEX",
        ),
        TickerData(
            symbol="WTI",
            name="WTI 원유",
            last=78.45,
            change_1d_pct=2.15,
            change_1w_pct=3.67,
            change_1m_pct=-1.23,
            sparkline_7d=[76, 75, 76.5, 77, 77.5, 77, 78.45],
            source="NYMEX",
        ),
        TickerData(
            symbol="KR3YT",
            name="국채 3년",
            last=3.42,
            change_1d_pct=0.05,
            change_1w_pct=0.12,
            sparkline_7d=[3.38, 3.39, 3.40, 3.41, 3.42, 3.41, 3.42],
            source="한국거래소",
        ),
        TickerData(
            symbol="KR10YT",
            name="국채 10년",
            last=3.68,
            change_1d_pct=0.08,
            change_1w_pct=0.15,
            sparkline_7d=[3.62, 3.63, 3.65, 3.66, 3.68, 3.67, 3.68],
            source="한국거래소",
        ),
    ]
    
    return TickersResponse(
        tickers=tickers,
        category="mixed"
    )

