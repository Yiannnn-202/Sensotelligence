"""WebSocket 端点 — 实时数据推送通道

协议:
  上行 (前端→后端): JSON  {"type": "start_session"|"stop_session"|"ping", ...}
  下行 (后端→前端): JSON  {"type": "frame"|"status"|"error", "timestamp": ..., "payload": {...}}
"""

import asyncio
import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.session_manager import session_manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    push_task: asyncio.Task | None = None
    active_session_id: str | None = None
    stop_requested = False
    send_lock = asyncio.Lock()

    async def send_json(message: dict):
        async with send_lock:
            await ws.send_json(message)

    async def send_status(msg: str, **payload):
        await send_json({
            "type": "status",
            "timestamp": time.time(),
            "payload": {"msg": msg, **payload},
        })

    async def send_error(msg: str, code: str = "WEBSOCKET_ERROR"):
        await send_json({
            "type": "error",
            "timestamp": time.time(),
            "payload": {"msg": msg, "code": code},
        })

    async def push_frame(frame):
        """将 RadarFrame 序列化后推送到前端"""
        # 取中心 bin 的相位值作为波形数据
        center_bin = frame.metadata.get("center_bin", 128)
        signal_value = frame.range_profile[center_bin] if frame.range_profile else 0.0

        await send_json({
            "type": "frame",
            "timestamp": frame.timestamp,
            "payload": {
                "frame_id": frame.metadata.get("frame_id", 0),
                "signal": signal_value,
                "range_profile": frame.range_profile,
                "ground_truth": frame.metadata.get("ground_truth", {}),
            },
        })

    async def push_session_frames(session):
        try:
            async for frame in session.frames():
                await push_frame(frame)
        except asyncio.CancelledError:
            raise
        except WebSocketDisconnect:
            raise
        except Exception as exc:
            await send_error(str(exc), "FRAME_STREAM_ERROR")
        finally:
            if not stop_requested:
                await send_status(
                    "stopped",
                    session_id=session.session_id,
                    frame_count=session.frame_count,
                )

    async def stop_push_task():
        nonlocal push_task
        if push_task and not push_task.done():
            try:
                await asyncio.wait_for(push_task, timeout=2)
            except asyncio.TimeoutError:
                push_task.cancel()
                try:
                    await push_task
                except asyncio.CancelledError:
                    pass
        push_task = None

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await send_error("Invalid JSON message", "INVALID_JSON")
                continue

            msg_type = msg.get("type", "")

            if msg_type == "start_session":
                stop_requested = True
                await session_manager.stop_session()
                await stop_push_task()
                stop_requested = False

                config = {
                    "hr_bpm": msg.get("hr_bpm", 72.0),
                    "rr_bpm": msg.get("rr_bpm", 16.0),
                    "noise_level": msg.get("noise_level", 0.05),
                }
                session = await session_manager.create_session(config)
                active_session_id = session.session_id

                await send_status(
                    "started",
                    session_id=session.session_id,
                    started_at=session.started_at,
                )
                push_task = asyncio.create_task(push_session_frames(session))

            elif msg_type == "stop_session":
                stop_requested = True
                session = await session_manager.stop_session()
                await stop_push_task()
                await send_status(
                    "stopped_ok",
                    session_id=session.session_id if session else active_session_id,
                    frame_count=session.frame_count if session else 0,
                    stopped_at=session.stopped_at if session else None,
                    duration_s=session.duration_s if session else 0,
                )
                active_session_id = None

            elif msg_type == "ping":
                await send_status("pong", session_id=active_session_id)

            else:
                await send_error(f"Unsupported message type: {msg_type}", "UNSUPPORTED_MESSAGE_TYPE")

    except WebSocketDisconnect:
        stop_requested = True
        await session_manager.stop_session()
        if push_task and not push_task.done():
            push_task.cancel()
    except Exception as e:
        stop_requested = True
        await session_manager.stop_session()
        try:
            await send_error(str(e))
        except Exception:
            pass
