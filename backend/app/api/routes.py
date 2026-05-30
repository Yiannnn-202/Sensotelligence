"""REST API 路由"""

from fastapi import APIRouter

from app.core.config import settings
from app.models.schemas import (
    SessionStartRequest,
    SessionStartResponse,
    SessionStopResponse,
    StatusResponse,
)
from app.services.session_manager import session_manager

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(
        version=settings.app_version,
        radar_connected=session_manager.current_session is not None,
        session_active=session_manager.is_active,
    )


@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(req: SessionStartRequest):
    config = {
        "hr_bpm": req.hr_bpm,
        "rr_bpm": req.rr_bpm,
        "noise_level": req.noise_level,
    }
    session = await session_manager.create_session(config)
    return SessionStartResponse(
        session_id=session.session_id,
        adapter="simulator",
    )


@router.post("/session/stop", response_model=SessionStopResponse)
async def stop_session():
    session = await session_manager.stop_session()
    if session:
        return SessionStopResponse(
            session_id=session.session_id,
            duration_s=(session.stopped_at - session.started_at) if session.stopped_at and session.started_at else 0,
            frame_count=session.frame_count,
        )
    return SessionStopResponse(session_id="", duration_s=0, frame_count=0)
