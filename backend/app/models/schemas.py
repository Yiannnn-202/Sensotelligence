"""Pydantic 数据模型 — API 请求/响应 & WebSocket 消息"""

from pydantic import BaseModel, Field


# ── REST API ──────────────────────────────────────────

class StatusResponse(BaseModel):
    backend: str = "running"
    version: str
    radar_connected: bool
    session_active: bool
    current_session_id: str | None = None

class SessionStartRequest(BaseModel):
    hr_bpm: float = Field(default=72.0, ge=40, le=200, description="模拟心率 (仅模拟器)")
    rr_bpm: float = Field(default=16.0, ge=5, le=60, description="模拟呼吸率 (仅模拟器)")
    noise_level: float = Field(default=0.05, ge=0, le=100, description="噪声水平；兼容 0.05 与 5 两种百分比写法")

class SessionStartResponse(BaseModel):
    session_id: str
    adapter: str           # "simulator" | "hardware"
    started_at: float | None = None

class SessionStopResponse(BaseModel):
    session_id: str
    duration_s: float
    frame_count: int
    started_at: float | None = None
    stopped_at: float | None = None

class SessionDetailResponse(BaseModel):
    session_id: str
    adapter: str
    source: str = "simulator"
    active: bool
    started_at: float | None = None
    stopped_at: float | None = None
    duration_s: float
    frame_count: int
    config: dict = Field(default_factory=dict)


# ── WebSocket 消息 ────────────────────────────────────

class WSClientMessage(BaseModel):
    """上行: 前端 → 后端"""
    type: str              # "start_session" | "stop_session" | "ping"
    hr_bpm: float | None = None
    rr_bpm: float | None = None
    noise_level: float | None = None

class WSServerMessage(BaseModel):
    """下行: 后端 → 前端"""
    type: str              # "frame" | "status" | "error"
    timestamp: float | None = None
    payload: dict | None = None
