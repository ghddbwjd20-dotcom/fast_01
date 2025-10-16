"""MongoDB 연결 관리"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.core.config import settings

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

mongo = MongoDB()


async def connect_to_mongo():
    """MongoDB 연결 초기화"""
    mongo.client = AsyncIOMotorClient(settings.MONGO_URI)
    mongo.db = mongo.client[settings.MONGO_DB]
    print(f"✅ MongoDB 연결 성공: {settings.MONGO_DB}")


async def close_mongo_connection():
    """MongoDB 연결 종료"""
    if mongo.client:
        mongo.client.close()
        print("✅ MongoDB 연결 종료")


def get_database() -> AsyncIOMotorDatabase:
    """데이터베이스 인스턴스 반환"""
    if mongo.db is None:
        raise RuntimeError("데이터베이스가 초기화되지 않았습니다.")
    return mongo.db

