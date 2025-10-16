"""챗봇 및 위젯 모델"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime


# ===== Chat Messages =====
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None
    name: Optional[str] = None


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    auto_brief: bool = False  # 자동 브리핑 모드


# ===== Widgets =====
class ChartWidget(BaseModel):
    type: Literal["chart"] = "chart"
    spec: Dict[str, Any]  # {type, series, y2, annotations}
    data: Dict[str, List[Dict[str, Any]]]  # {series_name: [{date, value}]}
    title: Optional[str] = None
    source: Optional[str] = None


class TableWidget(BaseModel):
    type: Literal["table"] = "table"
    columns: List[str]
    rows: List[Dict[str, Any]]
    title: Optional[str] = None
    source: Optional[str] = None


class CardWidget(BaseModel):
    type: Literal["card"] = "card"
    title: str
    body_md: str
    footer: Optional[str] = None
    variant: Optional[str] = "default"  # default, success, warning, error


Widget = ChartWidget | TableWidget | CardWidget


# ===== Chat Response =====
class ChatResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    widgets: List[Widget] = []
    suggestions: List[str] = []  # 후속 질문 제안
    sources: List[Dict[str, str]] = []  # 출처 정보


# ===== Session =====
class ChatSession(BaseModel):
    session_id: str
    history: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ===== Bookmark =====
class Bookmark(BaseModel):
    title: str
    widget_id: str
    widget_data: Dict[str, Any]
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ===== Report =====
class Report(BaseModel):
    title: str
    widget_ids: List[str]
    file_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ===== Tool Call Log =====
class ToolCallLog(BaseModel):
    session_id: str
    tool_name: str
    parameters: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    tokens_used: Optional[int] = None
    duration_ms: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

