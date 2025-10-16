"""경제 문제 생성 라우터"""
from fastapi import APIRouter, HTTPException
from app.models.common import ProblemGenRequest, ProblemGenResponse
from app.services.openai_svc import generate_problems

router = APIRouter(prefix="/problems", tags=["problems"])


@router.post("", response_model=ProblemGenResponse)
async def create_problems(request: ProblemGenRequest):
    """
    경제 문제 생성
    """
    try:
        items = await generate_problems(
            level=request.level,
            topic=request.topic,
            count=request.count,
            style=request.style
        )
        
        return ProblemGenResponse(
            items=items,
            level=request.level,
            topic=request.topic
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"문제 생성 실패: {str(e)}")

