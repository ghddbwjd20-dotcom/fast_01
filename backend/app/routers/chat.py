"""챗봇 라우터"""
from fastapi import APIRouter, HTTPException, Depends
from app.models.chat import ChatRequest, ChatResponse, ChatMessage
from app.services.chat_service import chat_with_tools, generate_auto_briefing
from app.db.mongo import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(request: ChatRequest):
    """
    챗봇 대화
    - 자연어 입력
    - 툴 호출 (데이터 조회, 차트 생성, 계산 등)
    - 위젯 생성 및 반환
    """
    try:
        # MongoDB dependency를 optional로 처리
        db = None
        try:
            db = get_database()
        except Exception:
            pass
        # 세션 ID 생성 또는 사용
        session_id = request.session_id or str(uuid.uuid4())
        
        # 자동 브리핑 모드
        if request.auto_brief:
            result = await generate_auto_briefing(session_id)
        else:
            # 세션 히스토리 로드 (MongoDB에서)
            session_history = []
            if db is not None:
                try:
                    session_doc = await db.sessions.find_one({"session_id": session_id})
                    if session_doc and "history" in session_doc:
                        session_history = [
                            ChatMessage(**msg) for msg in session_doc["history"][-10:]
                        ]
                except Exception:
                    pass  # MongoDB 연결 실패 시 빈 히스토리로 진행
            
            # 챗봇 실행
            result = await chat_with_tools(
                session_id=session_id,
                message=request.message,
                session_history=session_history
            )
        
        # 세션 저장 (MongoDB)
        if db is not None:
            try:
                await db.sessions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "session_id": session_id,
                            "history": result["messages"],
                            "updated_at": datetime.now()
                        }
                    },
                    upsert=True
                )
            except Exception as e:
                print(f"Session save error: {e}")
        
        # ChatMessage 객체로 변환
        messages = []
        for msg in result["messages"]:
            if isinstance(msg, dict):
                # tool_calls 정리
                if msg.get("role") == "assistant" and msg.get("tool_calls"):
                    messages.append(ChatMessage(
                        role="assistant",
                        content=msg.get("content", ""),
                        tool_calls=msg.get("tool_calls")
                    ))
                elif msg.get("role") == "tool":
                    messages.append(ChatMessage(
                        role="tool",
                        content=msg.get("content", ""),
                        tool_call_id=msg.get("tool_call_id"),
                        name=msg.get("name")
                    ))
                else:
                    messages.append(ChatMessage(
                        role=msg.get("role", "assistant"),
                        content=msg.get("content", "")
                    ))
        
        return ChatResponse(
            session_id=session_id,
            messages=messages,
            widgets=result.get("widgets", []),
            suggestions=result.get("suggestions", []),
            sources=result.get("sources", [])
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"챗봇 오류: {str(e)}")


@router.get("/briefing")
async def get_auto_briefing():
    """
    자동 브리핑 생성
    - 매일 아침 자동 생성용
    """
    try:
        session_id = f"briefing_{uuid.uuid4()}"
        result = await generate_auto_briefing(session_id)
        
        return {
            "session_id": session_id,
            "briefing": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"브리핑 생성 실패: {str(e)}")


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """세션 기록 조회"""
    try:
        session_doc = await db.sessions.find_one({"session_id": session_id})
        
        if not session_doc:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
        
        # ObjectId 변환
        session_doc["_id"] = str(session_doc["_id"])
        
        return session_doc
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"세션 조회 실패: {str(e)}")

