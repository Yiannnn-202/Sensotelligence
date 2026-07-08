"""REST API 路由"""

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.models.schemas import (
    SessionDetailResponse,
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
        current_session_id=session_manager.current_session.session_id if session_manager.current_session else None,
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
        started_at=session.started_at,
    )


@router.post("/session/stop", response_model=SessionStopResponse)
async def stop_session():
    session = await session_manager.stop_session()
    if session:
        return SessionStopResponse(
            session_id=session.session_id,
            duration_s=session.duration_s,
            frame_count=session.frame_count,
            started_at=session.started_at,
            stopped_at=session.stopped_at,
        )
    return SessionStopResponse(session_id="", duration_s=0, frame_count=0)


@router.get("/session/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return SessionDetailResponse(**session.to_detail())
