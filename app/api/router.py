from fastapi import APIRouter

from app.api.routes import bookmarks

api_router = APIRouter()
api_router.include_router(bookmarks.router)