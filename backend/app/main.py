"""FastAPI 메인 애플리케이션"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.routers import health, qa, problems, recommend, market


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # Startup
    print("🚀 애플리케이션 시작")
    await connect_to_mongo()
    yield
    # Shutdown
    print("👋 애플리케이션 종료")
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    description="최신 경제 지표를 한눈에 보여주는 AI 기반 대시보드",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(qa.router, prefix=settings.API_PREFIX)
app.include_router(problems.router, prefix=settings.API_PREFIX)
app.include_router(recommend.router, prefix=settings.API_PREFIX)
app.include_router(market.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs"
    }

