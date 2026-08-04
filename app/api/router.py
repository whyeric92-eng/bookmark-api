from fastapi import APIRouter

from app.api.routes import bookmarks,tags

api_router = APIRouter()
api_router.include_router(bookmarks.router)
api_router.include_router(tags.router)