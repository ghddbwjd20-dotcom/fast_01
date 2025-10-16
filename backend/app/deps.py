"""의존성 주입"""
from app.db.mongo import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase


async def get_db() -> AsyncIOMotorDatabase:
    """데이터베이스 의존성"""
    return get_database()

