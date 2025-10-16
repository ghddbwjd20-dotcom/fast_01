"""OpenAI Function Calling 툴 구현"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random


# ===== Tool 1: get_series =====
async def get_series(
    metrics: List[str],
    start: str = None,
    end: str = None
) -> Dict[str, Any]:
    """
    경제 지표 시계열 데이터 조회
    
    Args:
        metrics: 지표 리스트 (예: ["CPI_YOY", "POLICY_RATE"])
        start: 시작일 (YYYY-MM-DD)
        end: 종료일 (YYYY-MM-DD)
    
    Returns:
        {
            series_name: [{date: "2019-01", value: 2.3}, ...],
            ...
        }
    """
    # Mock 데이터 생성
    result = {}
    
    # 기본 기간 설정
    if not end:
        end_date = datetime.now()
    else:
        end_date = datetime.strptime(end, "%Y-%m-%d")
    
    if not start:
        start_date = end_date - timedelta(days=365 * 3)  # 3년
    else:
        start_date = datetime.strptime(start, "%Y-%m-%d")
    
    # 각 지표별 데이터 생성
    for metric in metrics:
        series = []
        current = start_date
        
        # 지표별 기본값 설정
        base_values = {
            "CPI_YOY": 2.0,
            "CORE_CPI_YOY": 1.8,
            "POLICY_RATE": 2.5,
            "UNEMPLOYMENT": 3.5,
            "GDP_YOY": 2.5,
            "USD_KRW": 1300,
        }
        
        base = base_values.get(metric, 100.0)
        
        while current <= end_date:
            # 약간의 트렌드와 노이즈 추가
            trend = (current - start_date).days / 365 * 0.2
            noise = random.uniform(-0.3, 0.3)
            value = base + trend + noise
            
            series.append({
                "date": current.strftime("%Y-%m"),
                "value": round(value, 2)
            })
            
            # 다음 달로
            if current.month == 12:
                current = datetime(current.year + 1, 1, 1)
            else:
                current = datetime(current.year, current.month + 1, 1)
        
        result[metric] = series
    
    return {
        "data": result,
        "source": "Mock Data / 실제 환경에서는 ECOS, KOSIS 연동",
        "updated_at": datetime.now().isoformat()
    }


# ===== Tool 2: make_chart =====
def make_chart(spec: Dict[str, Any]) -> Dict[str, Any]:
    """
    차트 위젯 스펙 생성
    
    Args:
        spec: {
            type: "line" | "area" | "bar" | "combo",
            series: ["CPI_YOY", "POLICY_RATE"],
            y2: ["POLICY_RATE"],  # 우측 축
            annotations: ["TARGET_2PCT"]  # 주석
        }
    
    Returns:
        차트 위젯 스펙
    """
    chart_type = spec.get("type", "line")
    series = spec.get("series", [])
    y2_series = spec.get("y2", [])
    annotations = spec.get("annotations", [])
    
    # 주석 변환
    annotation_configs = []
    for ann in annotations:
        if ann == "TARGET_2PCT":
            annotation_configs.append({
                "type": "horizontal_line",
                "y": 2.0,
                "label": "목표 물가 2%",
                "color": "#C8A96A"
            })
    
    return {
        "type": "chart",
        "spec": {
            "chart_type": chart_type,
            "series": series,
            "y2_axis": y2_series,
            "annotations": annotation_configs
        },
        "meta": {
            "created_at": datetime.now().isoformat(),
            "tool": "make_chart"
        }
    }


# ===== Tool 3: get_calendar =====
async def get_calendar(
    from_date: str = None,
    to_date: str = None,
    country: str = "KR"
) -> List[Dict[str, Any]]:
    """
    경제지표 발표 캘린더
    
    Args:
        from_date: 시작일
        to_date: 종료일
        country: 국가 코드
    
    Returns:
        발표 일정 리스트
    """
    # Mock 캘린더
    today = datetime.now()
    events = []
    
    indicators = [
        ("CPI", "소비자물가지수", "high"),
        ("Unemployment", "실업률", "medium"),
        ("GDP", "GDP 성장률", "high"),
        ("Retail Sales", "소매판매", "medium"),
        ("Policy Rate", "기준금리 결정", "high"),
    ]
    
    for i, (code, name, importance) in enumerate(indicators):
        event_date = today + timedelta(days=i + 1)
        events.append({
            "datetime": event_date.strftime("%Y-%m-%d %H:%M"),
            "indicator": name,
            "code": code,
            "consensus": None,
            "previous": None,
            "importance": importance,
            "country": country,
            "source": "Mock Calendar"
        })
    
    return {
        "events": events,
        "period": f"{from_date or 'now'} ~ {to_date or '+7days'}"
    }


# ===== Tool 4: calc_whatif =====
def calc_whatif(formula: str, inputs: Dict[str, float]) -> Dict[str, Any]:
    """
    결정적 계산 (수식 평가)
    
    Args:
        formula: 계산 수식 (예: "spread = rate_10y - rate_3y")
        inputs: 입력 값 (예: {"rate_10y": 3.5, "rate_3y": 3.2})
    
    Returns:
        계산 결과
    """
    result = {}
    
    try:
        # 간단한 수식 평가 (실제로는 더 정교한 파서 필요)
        if "spread" in formula:
            # Yield spread 계산
            rate_10y = inputs.get("rate_10y", 3.5)
            rate_3y = inputs.get("rate_3y", 3.2)
            spread = rate_10y - rate_3y
            result["spread"] = round(spread, 2)
            result["spread_bps"] = round(spread * 100, 0)
            result["interpretation"] = "정상" if spread > 0 else "역전 (경기침체 신호)"
        
        elif "rate_change_impact" in formula:
            # 금리 변화 영향
            rate_change_bp = inputs.get("rate_change_bp", 25)
            current_rate = inputs.get("current_rate", 3.5)
            new_rate = current_rate + (rate_change_bp / 100)
            
            result["new_rate"] = round(new_rate, 2)
            result["mortgage_impact_pct"] = round(rate_change_bp / 100 * 1.2, 2)  # 대출금리 영향
            result["bond_yield_impact_bp"] = rate_change_bp
        
        else:
            # 일반 수식
            result["raw_formula"] = formula
            result["inputs"] = inputs
            result["note"] = "복잡한 수식은 추가 구현 필요"
        
        result["success"] = True
        
    except Exception as e:
        result["success"] = False
        result["error"] = str(e)
    
    return result


# ===== Tool 5: save_bookmark =====
async def save_bookmark(title: str, widget_id: str, db_client=None) -> Dict[str, Any]:
    """
    위젯 북마크 저장
    
    Args:
        title: 북마크 제목
        widget_id: 위젯 ID
        db_client: MongoDB 클라이언트
    
    Returns:
        저장 결과
    """
    # MongoDB 저장 로직 (실제 구현 필요)
    bookmark = {
        "title": title,
        "widget_id": widget_id,
        "created_at": datetime.now().isoformat()
    }
    
    # 여기서는 mock 응답
    return {
        "success": True,
        "bookmark_id": f"bm_{widget_id}",
        "message": f"'{title}' 북마크가 저장되었습니다."
    }


# ===== Tool 6: render_report =====
async def render_report(title: str, widget_ids: List[str]) -> Dict[str, Any]:
    """
    PDF 리포트 생성
    
    Args:
        title: 리포트 제목
        widget_ids: 포함할 위젯 ID 리스트
    
    Returns:
        리포트 정보
    """
    # PDF 생성 로직 (실제 구현 필요 - ReportLab, WeasyPrint 등)
    file_path = f"/reports/{title.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return {
        "success": True,
        "report_id": f"report_{datetime.now().timestamp()}",
        "title": title,
        "widget_count": len(widget_ids),
        "file_path": file_path,
        "download_url": f"/api/reports/download/{file_path}",
        "message": f"리포트 '{title}'가 생성되었습니다."
    }


# ===== Tool Definitions (OpenAI Format) =====
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_series",
            "description": "경제 지표의 시계열 데이터를 조회합니다. CPI, 금리, 실업률 등의 과거 데이터를 가져올 수 있습니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "metrics": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "조회할 지표 리스트 (예: ['CPI_YOY', 'POLICY_RATE', 'UNEMPLOYMENT'])"
                    },
                    "start": {
                        "type": "string",
                        "description": "시작일 (YYYY-MM-DD 형식, 선택사항)"
                    },
                    "end": {
                        "type": "string",
                        "description": "종료일 (YYYY-MM-DD 형식, 선택사항)"
                    }
                },
                "required": ["metrics"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "make_chart",
            "description": "데이터를 시각화할 차트 위젯을 생성합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "spec": {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": ["line", "area", "bar", "combo"],
                                "description": "차트 타입"
                            },
                            "series": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "표시할 시리즈 리스트"
                            },
                            "y2": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "우측 Y축에 표시할 시리즈 (선택사항)"
                            },
                            "annotations": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "차트 주석 (예: ['TARGET_2PCT'])"
                            }
                        },
                        "required": ["type", "series"]
                    }
                },
                "required": ["spec"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_calendar",
            "description": "경제지표 발표 일정을 조회합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "from_date": {"type": "string", "description": "시작일 (선택사항)"},
                    "to_date": {"type": "string", "description": "종료일 (선택사항)"},
                    "country": {"type": "string", "description": "국가 코드 (기본값: KR)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calc_whatif",
            "description": "경제 지표 계산을 수행합니다. 스프레드, 증감률, 영향 분석 등을 결정적으로 계산합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "formula": {
                        "type": "string",
                        "description": "계산 수식 (예: 'spread', 'rate_change_impact')"
                    },
                    "inputs": {
                        "type": "object",
                        "description": "입력 값들"
                    }
                },
                "required": ["formula", "inputs"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "save_bookmark",
            "description": "현재 위젯이나 응답을 북마크에 저장합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "북마크 제목"},
                    "widget_id": {"type": "string", "description": "위젯 ID"}
                },
                "required": ["title", "widget_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "render_report",
            "description": "위젯들을 모아 PDF 리포트를 생성합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "리포트 제목"},
                    "widget_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "포함할 위젯 ID 리스트"
                    }
                },
                "required": ["title", "widget_ids"]
            }
        }
    }
]


# ===== Tool Executor =====
async def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """툴 실행 라우터"""
    if tool_name == "get_series":
        return await get_series(**arguments)
    elif tool_name == "make_chart":
        return make_chart(**arguments)
    elif tool_name == "get_calendar":
        return await get_calendar(**arguments)
    elif tool_name == "calc_whatif":
        return calc_whatif(**arguments)
    elif tool_name == "save_bookmark":
        return await save_bookmark(**arguments)
    elif tool_name == "render_report":
        return await render_report(**arguments)
    else:
        return {"error": f"Unknown tool: {tool_name}"}

