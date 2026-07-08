"""监测会话管理 — 控制采集生命周期"""

import asyncio
import time
import uuid

from app.core.radar_interface import RadarFrame, RadarInterface
from app.adapters.simulator_adapter import SimulatorAdapter


def normalize_session_config(config: dict | None = None) -> dict:
    """兼容前端 0.05 和 5 两种 noise_level 写法。"""

    config = config or {}

    hr_bpm = float(config.get("hr_bpm", 72.0))
    rr_bpm = float(config.get("rr_bpm", 16.0))
    noise_level = float(config.get("noise_level", 0.05))

    if noise_level > 1:
        noise_level = noise_level / 100

    return {
        "hr_bpm": max(40.0, min(200.0, hr_bpm)),
        "rr_bpm": max(5.0, min(60.0, rr_bpm)),
        "noise_level": max(0.0, min(0.5, noise_level)),
    }


class MonitoringSession:
    """一次监测会话，持有雷达适配器实例"""

    def __init__(self, adapter: RadarInterface, config: dict | None = None):
        self.session_id = str(uuid.uuid4())[:8]
        self.adapter = adapter
        self.adapter_name = "simulator"
        self.config = config or {}
        self.started_at: float | None = None
        self.stopped_at: float | None = None
        self.frame_count = 0
        self._task: asyncio.Task | None = None
        self._frame_queue: asyncio.Queue[RadarFrame | None] = asyncio.Queue(maxsize=500)

    @property
    def is_active(self) -> bool:
        return self._task is not None and not self._task.done()

    async def start(self) -> None:
        self.started_at = time.time()
        self._task = asyncio.create_task(self._run())

    async def _run(self) -> None:
        try:
            async for frame in self.adapter.start_stream():
                self.frame_count += 1
                # 非阻塞入队；队列满时丢弃最旧帧
                try:
                    self._frame_queue.put_nowait(frame)
                except asyncio.QueueFull:
                    self._frame_queue.get_nowait()   # 丢弃最旧的
                    self._frame_queue.put_nowait(frame)
        except Exception as e:
            await self._frame_queue.put(None)  # 结束信号
            raise e
        finally:
            await self._frame_queue.put(None)  # 结束信号

    async def stop(self) -> None:
        await self.adapter.stop()
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        if self.stopped_at is None:
            self.stopped_at = time.time()

    async def frames(self):
        """异步迭代器: 消费帧队列"""
        while True:
            frame = await self._frame_queue.get()
            if frame is None:
                break
            yield frame

    @property
    def duration_s(self) -> float:
        if self.started_at is None:
            return 0.0
        end = self.stopped_at or time.time()
        return max(0.0, end - self.started_at)

    def to_detail(self) -> dict:
        return {
            "session_id": self.session_id,
            "adapter": self.adapter_name,
            "source": self.adapter_name,
            "active": self.is_active,
            "started_at": self.started_at,
            "stopped_at": self.stopped_at,
            "duration_s": self.duration_s,
            "frame_count": self.frame_count,
            "config": self.config,
        }


class SessionManager:
    """管理所有监测会话（当前只支持单会话）"""

    def __init__(self):
        self._current_session: MonitoringSession | None = None
        self._sessions: dict[str, MonitoringSession] = {}

    @property
    def current_session(self) -> MonitoringSession | None:
        return self._current_session

    @property
    def is_active(self) -> bool:
        return self._current_session is not None and self._current_session.is_active

    async def create_session(self, config: dict | None = None) -> MonitoringSession:
        """创建并启动新会话，自动停止旧会话"""
        await self.stop_session()

        normalized_config = normalize_session_config(config)
        adapter = SimulatorAdapter()
        await adapter.connect(normalized_config)
        session = MonitoringSession(adapter, normalized_config)
        await session.start()
        self._current_session = session
        self._sessions[session.session_id] = session
        return session

    async def stop_session(self) -> MonitoringSession | None:
        session = self._current_session
        if session:
            await session.stop()
        self._current_session = None
        return session

    def get_session(self, session_id: str) -> MonitoringSession | None:
        return self._sessions.get(session_id)


# 全局单例
session_manager = SessionManager()
