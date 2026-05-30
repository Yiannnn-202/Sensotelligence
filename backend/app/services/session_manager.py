"""监测会话管理 — 控制采集生命周期"""

import asyncio
import time
import uuid
from typing import Any

from app.core.radar_interface import RadarFrame, RadarInterface
from app.adapters.simulator_adapter import SimulatorAdapter


class MonitoringSession:
    """一次监测会话，持有雷达适配器实例"""

    def __init__(self, adapter: RadarInterface):
        self.session_id = str(uuid.uuid4())[:8]
        self.adapter = adapter
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
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self.stopped_at = time.time()

    async def frames(self):
        """异步迭代器: 消费帧队列"""
        while True:
            frame = await self._frame_queue.get()
            if frame is None:
                break
            yield frame


class SessionManager:
    """管理所有监测会话（当前只支持单会话）"""

    def __init__(self):
        self._current_session: MonitoringSession | None = None

    @property
    def current_session(self) -> MonitoringSession | None:
        return self._current_session

    @property
    def is_active(self) -> bool:
        return self._current_session is not None and self._current_session.is_active

    async def create_session(self, config: dict | None = None) -> MonitoringSession:
        """创建并启动新会话，自动停止旧会话"""
        await self.stop_session()

        adapter = SimulatorAdapter()
        await adapter.connect(config or {})
        session = MonitoringSession(adapter)
        await session.start()
        self._current_session = session
        return session

    async def stop_session(self) -> MonitoringSession | None:
        session = self._current_session
        if session and session.is_active:
            await session.stop()
        self._current_session = None
        return session


# 全局单例
session_manager = SessionManager()
