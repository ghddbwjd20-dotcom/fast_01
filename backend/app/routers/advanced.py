"""고급 기능 라우터"""
from fastapi import APIRouter, HTTPException
from app.models.advanced import (
    ExtendedKPIData, CalendarResponse,
    TickersResponse, AIChartRequest, AIChartResponse,
    AIExplainRequest, AIExplainResponse,
    WhatIfRequest, WhatIfResponse
)
from app.services.advanced_adapters import (
    generate_extended_kpis,
    generate_calendar_events,
    generate_market_tickers
)
from app.services.ai_advanced import (
    generate_chart_from_query,
    get_metric_explanation,
    generate_whatif_scenario
)

router = APIRouter(tags=["advanced"])


@router.get("/market/kpis/extended", response_model=ExtendedKPIData)
async def get_extended_kpis():
    """
    확장된 KPI 데이터 (스파크라인 포함)
    - 10개 주요 지표
    - 각 지표별 12개월 스파크라인
    - MoM, YoY 변화율
    """
    return generate_extended_kpis()


@router.get("/market/calendar", response_model=CalendarResponse)
async def get_calendar():
    """
    경제 지표 캘린더
    - 다음 주 주요 발표 일정
    - Actual, Consensus, Previous
    - Surprise (차이) 계산
    """
    return generate_calendar_events()


@router.get("/market/tickers", response_model=TickersResponse)
async def get_tickers():
    """
    실시간 마켓 티커
    - 환율, 증시, 원자재, 국채
    - 7일 스파크라인
    - 1D/1W/1M 변화율
    """
    return generate_market_tickers()


@router.post("/ai/chart", response_model=AIChartResponse)
async def create_chart_from_query(request: AIChartRequest):
    """
    자연어로 차트 생성
    예: "2019년부터 지금까지 CPI와 금리 비교해줘"
    """
    try:
        result = await generate_chart_from_query(
            query=request.query,
            date_range=request.date_range
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"차트 생성 실패: {str(e)}")


@router.post("/ai/explain", response_model=AIExplainResponse)
async def explain_metric(request: AIExplainRequest):
    """
    경제 지표 설명
    - level: easy, intermediate, advanced
    - 정의, 중요성, 일반적 시장 반응
    """
    try:
        return get_metric_explanation(request.metric, request.level)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"설명 생성 실패: {str(e)}")


@router.post("/ai/whatif", response_model=WhatIfResponse)
async def whatif_scenario(request: WhatIfRequest):
    """
    What-if 시나리오 분석
    예: "금리가 25bp 인상되면?"
    - 3가지 시나리오 (낙관/기준/비관)
    - 가정 및 면책사항
    """
    try:
        result = await generate_whatif_scenario(
            scenario=request.scenario,
            parameters=request.parameters
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시나리오 분석 실패: {str(e)}")

