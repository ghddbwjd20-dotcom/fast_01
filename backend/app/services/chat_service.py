"""챗봇 서비스 (OpenAI Function Calling)"""
import json
import uuid
from typing import List, Dict, Any
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.chat import ChatMessage, ChatSession, Widget
from app.services.tools import TOOL_DEFINITIONS, execute_tool

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# 시스템 프롬프트
SYSTEM_PROMPT = """당신은 경제 분석 코파일럿입니다.

**핵심 원칙:**
1. 모르는 것은 모른다고 말하고, 추측하지 않습니다.
2. 모든 데이터에 출처와 날짜를 명시합니다.
3. 산술/통계/집계는 반드시 calc_whatif 툴을 사용합니다.
4. 차트는 make_chart 툴로 생성합니다.
5. 설명은 마크다운으로 간결하게 작성합니다.

**응답 형식:**
- 핵심 답변을 먼저 제시
- 필요시 차트/표 생성
- 출처 명시
- 면책 문구 (투자 조언 시)
- 후속 질문 제안 2-3개

**툴 사용:**
- get_series: 시계열 데이터 조회
- make_chart: 차트 생성
- get_calendar: 발표 일정
- calc_whatif: 계산/시나리오
- save_bookmark: 북마크 저장
- render_report: PDF 리포트

**톤:**
전문적이지만 친근하게, 복잡한 개념은 쉽게 설명합니다.
"""


async def chat_with_tools(
    session_id: str,
    message: str,
    session_history: List[ChatMessage] = None
) -> Dict[str, Any]:
    """
    툴을 사용하는 대화형 챗봇
    
    Args:
        session_id: 세션 ID
        message: 사용자 메시지
        session_history: 이전 대화 기록
    
    Returns:
        {
            session_id,
            messages: [...],
            widgets: [...],
            suggestions: [...],
            sources: [...]
        }
    """
    # 세션 히스토리 초기화
    if session_history is None:
        session_history = []
    
    # 시스템 메시지 + 히스토리 + 새 메시지
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    # 기존 히스토리 추가
    for msg in session_history[-10:]:  # 최근 10개만
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # 새 사용자 메시지
    messages.append({
        "role": "user",
        "content": message
    })
    
    # OpenAI 호출 (최대 5번 반복 - 툴 호출 처리)
    max_iterations = 5
    iteration = 0
    widgets = []
    tool_results = {}
    
    while iteration < max_iterations:
        iteration += 1
        
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            max_tokens=2000,
            temperature=0.7
        )
        
        assistant_message = response.choices[0].message
        
        # 툴 호출이 없으면 종료
        if not assistant_message.tool_calls:
            # 최종 응답
            messages.append({
                "role": "assistant",
                "content": assistant_message.content or ""
            })
            break
        
        # 툴 호출 처리
        messages.append({
            "role": "assistant",
            "content": assistant_message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                }
                for tc in assistant_message.tool_calls
            ]
        })
        
        # 각 툴 실행
        for tool_call in assistant_message.tool_calls:
            tool_name = tool_call.function.name
            tool_args = json.loads(tool_call.function.arguments)
            
            print(f"[TOOL] {tool_name}({tool_args})")
            
            # 툴 실행
            tool_result = await execute_tool(tool_name, tool_args)
            tool_results[tool_call.id] = tool_result
            
            # 결과를 메시지에 추가
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": tool_name,
                "content": json.dumps(tool_result, ensure_ascii=False)
            })
            
            # 위젯 생성
            if tool_name == "make_chart":
                widget_id = str(uuid.uuid4())
                # get_series 결과와 결합하여 위젯 생성
                chart_spec = tool_result
                
                # 이전 get_series 결과 찾기
                series_data = {}
                for tid, result in tool_results.items():
                    if "data" in result and isinstance(result["data"], dict):
                        series_data = result["data"]
                        break
                
                widgets.append({
                    "id": widget_id,
                    "type": "chart",
                    "spec": chart_spec.get("spec", {}),
                    "data": series_data,
                    "title": "차트",
                    "source": series_data.get("source", "Mock Data")
                })
    
    # 후속 질문 제안 추출 (간단한 휴리스틱)
    suggestions = generate_suggestions(message, widgets)
    
    # 출처 정보 추출
    sources = extract_sources(tool_results)
    
    return {
        "session_id": session_id,
        "messages": messages,
        "widgets": widgets,
        "suggestions": suggestions,
        "sources": sources
    }


def generate_suggestions(user_message: str, widgets: List[Dict]) -> List[str]:
    """후속 질문 제안 생성"""
    suggestions = []
    
    msg_lower = user_message.lower()
    
    if "cpi" in msg_lower or "물가" in msg_lower:
        suggestions.append("코어 CPI와 헤드라인 CPI의 차이는?")
        suggestions.append("최근 물가 상승 원인 3가지만 알려줘")
    
    if "금리" in msg_lower or "rate" in msg_lower:
        suggestions.append("금리 인상이 주택시장에 미치는 영향은?")
        suggestions.append("다음 금통위 일정은 언제야?")
    
    if "차트" in msg_lower or "그래프" in msg_lower:
        suggestions.append("같은 데이터를 표로 보여줘")
        suggestions.append("최근 1년만 확대해줘")
    
    # 기본 제안
    if not suggestions:
        suggestions = [
            "이 지표의 의미를 초보자도 알기 쉽게 설명해줘",
            "다음 주 주요 경제 발표 일정 알려줘",
            "이 차트를 북마크에 저장해줘"
        ]
    
    return suggestions[:3]


def extract_sources(tool_results: Dict[str, Any]) -> List[Dict[str, str]]:
    """툴 결과에서 출처 정보 추출"""
    sources = []
    
    for result in tool_results.values():
        if "source" in result:
            sources.append({
                "name": result["source"],
                "updated_at": result.get("updated_at", "")
            })
    
    # 중복 제거
    unique_sources = []
    seen = set()
    for source in sources:
        key = source["name"]
        if key not in seen:
            seen.add(key)
            unique_sources.append(source)
    
    return unique_sources


async def generate_auto_briefing(session_id: str) -> Dict[str, Any]:
    """
    자동 브리핑 생성
    - 오늘의 핵심 지표 3개
    - 주요 포인트 3줄
    - 차트 2개
    - 오늘/이번 주 일정 3건
    """
    briefing_prompt = """오늘의 경제 브리핑을 생성해주세요:

1. **핵심 지표 3개**: CPI, 기준금리, 실업률의 최신 값과 전월 대비
2. **주요 포인트 3줄**: 한 줄 요약
3. **차트 2개**: CPI 추이, 금리 vs 실업률
4. **이번 주 일정**: 주요 발표 3건

각 섹션을 명확히 구분하고, 차트는 make_chart 툴로 생성해주세요."""
    
    return await chat_with_tools(session_id, briefing_prompt)

