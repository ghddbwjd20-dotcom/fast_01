"""AI 고급 기능"""
import json
from typing import Dict, Any
from app.services.openai_svc import client, SYSTEM_PROMPT_BASE
from app.models.advanced import AIChartResponse, AIExplainResponse, WhatIfResponse
from app.core.config import settings


# 경제 지표 설명 데이터베이스
METRIC_DEFINITIONS = {
    "cpi": {
        "name": "소비자물가지수 (CPI)",
        "definition": "가계가 구매하는 상품과 서비스의 가격 변동을 측정하는 지표",
        "why_matters": "실질 구매력과 인플레이션을 파악하는 핵심 지표이며, 중앙은행의 통화정책 결정에 가장 중요한 영향을 미칩니다.",
        "typical_reaction": "CPI가 높으면 긴축 정책 기대감이 커지고, 주식은 하락, 통화는 강세를 보일 수 있습니다."
    },
    "core_cpi": {
        "name": "근원 소비자물가지수 (Core CPI)",
        "definition": "식품과 에너지 가격을 제외한 소비자물가지수로, 변동성이 큰 항목을 제외하여 추세적 물가를 측정",
        "why_matters": "단기 변동성을 제거하여 기저 인플레이션 압력을 더 정확히 파악할 수 있습니다.",
        "typical_reaction": "Core CPI가 높으면 구조적 인플레이션 우려로 장기 금리 상승 가능성이 높아집니다."
    },
    "policy_rate": {
        "name": "기준금리 (Policy Rate)",
        "definition": "중앙은행이 설정하는 정책 금리로, 시중 금리의 기준이 됩니다.",
        "why_matters": "대출과 투자 비용을 결정하여 경기와 물가에 직접적인 영향을 미칩니다.",
        "typical_reaction": "금리 인상 시 채권 가격 하락, 통화 강세, 성장주 약세 경향이 있습니다."
    },
    "unemployment": {
        "name": "실업률 (Unemployment Rate)",
        "definition": "경제활동인구 중 실업자가 차지하는 비율",
        "why_matters": "경기의 후행 또는 동행 지표로, 고용 시장 건전성과 소비 여력을 나타냅니다.",
        "typical_reaction": "실업률 상승은 경기 둔화 신호로 완화적 정책 기대감을 높일 수 있습니다."
    },
    "gdp_growth": {
        "name": "GDP 성장률",
        "definition": "국내총생산의 증가율로, 경제 전체의 성장 속도를 나타냅니다.",
        "why_matters": "경제 규모 변화와 수요/공급 사이클을 파악하는 가장 포괄적인 지표입니다.",
        "typical_reaction": "GDP 성장률이 높으면 주식 시장에 긍정적이지만, 과열 우려 시 금리 인상 압력도 커집니다."
    },
    "trade_balance": {
        "name": "무역수지",
        "definition": "수출액에서 수입액을 뺀 값으로, 국제 거래의 순 흐름을 나타냅니다.",
        "why_matters": "외환 수급과 성장에 간접적 영향을 주며, 경상수지의 주요 구성 요소입니다.",
        "typical_reaction": "무역흑자 확대는 통화 강세 요인이 될 수 있지만, 맥락에 따라 다릅니다."
    },
    "usdkrw": {
        "name": "원달러 환율 (USD/KRW)",
        "definition": "1달러를 사는 데 필요한 원화의 양",
        "why_matters": "외환 수급, 금리 차, 리스크 온/오프 상황을 반영하는 종합 지표입니다.",
        "typical_reaction": "원화 약세(환율 상승)는 수출 기업에 유리하지만 수입 물가 상승 요인이 됩니다."
    },
}


async def generate_chart_from_query(query: str, date_range: str = None) -> AIChartResponse:
    """자연어 쿼리로부터 차트 설정 생성"""
    
    prompt = f"""다음 자연어 요청을 차트 설정으로 변환하세요:

요청: "{query}"
{f"기간: {date_range}" if date_range else ""}

다음 JSON 형식으로 응답하세요:
{{
  "chart_type": "line" | "bar" | "combo" | "area",
  "title": "차트 제목",
  "data_keys": ["지표1", "지표2"],
  "time_range": "2019-2024" 등,
  "chart_config": {{
    "y_axis": "left" | "dual",
    "annotations": ["주석 설명"]
  }},
  "explanation": "이 차트가 보여주는 것"
}}

사용 가능한 지표: CPI, Core CPI, 기준금리, 실업률, GDP, 환율, KOSPI, S&P500
"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_BASE},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        
        return AIChartResponse(
            chart_type=data.get("chart_type", "line"),
            title=data.get("title", "차트"),
            data_keys=data.get("data_keys", []),
            time_range=data.get("time_range", "recent"),
            chart_config=data.get("chart_config", {}),
            explanation=data.get("explanation", "")
        )
    
    except Exception as e:
        # 기본 응답
        return AIChartResponse(
            chart_type="line",
            title=query,
            data_keys=["CPI", "기준금리"],
            time_range="2019-2024",
            chart_config={"y_axis": "dual"},
            explanation=f"'{query}' 차트 생성 중 오류 발생: {str(e)}"
        )


def get_metric_explanation(metric: str, level: str = "easy") -> AIExplainResponse:
    """지표 설명 제공 (DB 기반)"""
    
    metric_lower = metric.lower().replace(" ", "_").replace("-", "_")
    
    # 데이터베이스에서 찾기
    for key, data in METRIC_DEFINITIONS.items():
        if key in metric_lower or metric_lower in key:
            # level에 따라 설명 조정
            if level == "easy":
                definition = data["definition"]
                why_matters = "간단히 말하면, " + data["why_matters"][:100] + "..."
            else:
                definition = data["definition"]
                why_matters = data["why_matters"]
            
            return AIExplainResponse(
                metric=data["name"],
                definition=definition,
                why_matters=why_matters,
                typical_reaction=data["typical_reaction"],
                current_value="최근 데이터 참조",
                interpretation_tip=f"이 지표는 {data['why_matters'][:50]}..."
            )
    
    # 찾지 못한 경우 기본 응답
    return AIExplainResponse(
        metric=metric,
        definition=f"{metric}에 대한 정의를 찾을 수 없습니다.",
        why_matters="추가 정보가 필요합니다.",
        typical_reaction="시장 반응은 상황에 따라 다릅니다."
    )


async def generate_whatif_scenario(scenario: str, parameters: Dict[str, Any]) -> WhatIfResponse:
    """What-if 시나리오 생성"""
    
    prompt = f"""다음 시나리오에 대해 3가지 가능한 결과를 분석하세요:

시나리오: "{scenario}"
파라미터: {json.dumps(parameters, ensure_ascii=False)}

다음 형식으로 응답하세요:
{{
  "scenarios": [
    {{
      "name": "낙관적 시나리오",
      "probability": "30%",
      "impacts": ["영향1", "영향2"],
      "timeframe": "3-6개월"
    }},
    {{
      "name": "기준 시나리오",
      "probability": "50%",
      "impacts": [...],
      "timeframe": "3-6개월"
    }},
    {{
      "name": "비관적 시나리오",
      "probability": "20%",
      "impacts": [...],
      "timeframe": "3-6개월"
    }}
  ],
  "assumptions": ["가정1", "가정2"],
  "disclaimer": "이 분석은 과거 데이터 기반 추정이며..."
}}
"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_BASE + "\n시나리오 분석 전문가로서 답변하세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        
        return WhatIfResponse(
            scenario=scenario,
            scenarios=data.get("scenarios", []),
            assumptions=data.get("assumptions", []),
            disclaimer=data.get("disclaimer", "이 분석은 참고용입니다.")
        )
    
    except Exception as e:
        return WhatIfResponse(
            scenario=scenario,
            scenarios=[
                {
                    "name": "기본 시나리오",
                    "probability": "불확실",
                    "impacts": [f"분석 중 오류 발생: {str(e)}"],
                    "timeframe": "불명"
                }
            ],
            assumptions=["AI 분석 실패"],
            disclaimer="시나리오 생성 중 오류가 발생했습니다."
        )

