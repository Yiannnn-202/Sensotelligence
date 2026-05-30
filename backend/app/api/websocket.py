"""WebSocket 端点 — 实时数据推送通道

协议:
  上行 (前端→后端): JSON  {"type": "start_session"|"stop_session"|"ping", ...}
  下行 (后端→前端): JSON  {"type": "frame"|"status"|"error", "timestamp": ..., "payload": {...}}
"""

import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.session_manager import session_manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    running = False

    async def push_frame(frame):
        """将 RadarFrame 序列化后推送到前端"""
        try:
            # 取中心 bin 的相位值作为波形数据
            center_bin = frame.metadata.get("center_bin", 128)
            signal_value = frame.range_profile[center_bin] if frame.range_profile else 0.0

            await ws.send_json({
                "type": "frame",
                "timestamp": frame.timestamp,
                "payload": {
                    "frame_id": frame.metadata.get("frame_id", 0),
                    "signal": signal_value,                     # 中心 bin 的相位值
                    "range_profile": frame.range_profile,       # 完整距离轮廓（用于后续处理）
                    "ground_truth": frame.metadata.get("ground_truth", {}),
                },
            })
        except Exception:
            pass  # 客户端断开时静默处理

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type", "")

            if msg_type == "start_session":
                config = {
                    "hr_bpm": msg.get("hr_bpm", 72.0),
                    "rr_bpm": msg.get("rr_bpm", 16.0),
                    "noise_level": msg.get("noise_level", 0.05),
                }
                session = await session_manager.create_session(config)
                running = True

                await ws.send_json({
                    "type": "status",
                    "timestamp": time.time(),
                    "payload": {"msg": "started", "session_id": session.session_id},
                })

                # 进入推送循环
                try:
                    async for frame in session.frames():
                        if not running:
                            break
                        await push_frame(frame)
                except Exception:
                    pass

                await ws.send_json({
                    "type": "status",
                    "timestamp": time.time(),
                    "payload": {"msg": "stopped", "frame_count": session.frame_count},
                })

            elif msg_type == "stop_session":
                running = False
                await session_manager.stop_session()
                await ws.send_json({
                    "type": "status",
                    "timestamp": time.time(),
                    "payload": {"msg": "stopped_ok"},
                })

            elif msg_type == "ping":
                await ws.send_json({
                    "type": "status",
                    "timestamp": time.time(),
                    "payload": {"msg": "pong"},
                })

    except WebSocketDisconnect:
        running = False
        await session_manager.stop_session()
    except Exception as e:
        running = False
        await session_manager.stop_session()
        try:
            await ws.send_json({
                "type": "error",
                "timestamp": time.time(),
                "payload": {"msg": str(e)},
            })
        except Exception:
            pass
