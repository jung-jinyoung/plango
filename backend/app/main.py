from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import categories, goals, health, retrospectives, schedules, todos, users
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(users.router)
app.include_router(goals.router)
app.include_router(todos.router)
app.include_router(schedules.router)
app.include_router(categories.router)
app.include_router(retrospectives.router)
