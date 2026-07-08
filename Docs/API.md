# Sensotelligence API Contract

> Based on the current frontend implementation under `frontend/src`.
> This document describes what the frontend actually depends on today, then gives a backward-compatible target contract for backend development.

## 1. Scope

The current frontend is already a multi-page product prototype, but it does not yet consume a full backend API. Its real data integration is concentrated in the monitoring page:

- `frontend/src/hooks/useWebSocket.ts`
- `frontend/src/pages/MonitorPage.tsx`
- `frontend/vite.config.ts`

Other pages are mostly static or browser-local:

- `/results` reads profile data from `localStorage` and uses hardcoded report values.
- `/history` uses hardcoded records and trend data.
- `/professional` describes planned backend capabilities.
- `/` only routes the user to monitoring/report/technical pages.

## 2. Runtime and base URLs

| Item | Value | Notes |
|---|---|---|
| Frontend dev server | `http://localhost:5173` | Vite |
| Backend HTTP target | `http://localhost:8000` | Vite proxies `/api` to this target |
| Backend WebSocket target | `ws://localhost:8000/ws` | Current hook connects directly to this URL |
| WebSocket proxy | `/ws` -> `ws://localhost:8000` | Configured in Vite but not used by the current hook default |
| REST proxy | `/api` -> `http://localhost:8000` | Configured but current frontend does not call REST APIs |

Current WebSocket hook default:

```ts
useWebSocket(url: string = 'ws://localhost:8000/ws')
```

## 3. Frontend route map and backend dependencies

| Route | Page | Current backend dependency | Current data source |
|---|---|---|---|
| `/` | Home page | None | Static content, external videos, route links |
| `/detect` | Monitoring page | `ws://localhost:8000/ws` | WebSocket frames + browser profile |
| `/detect?role=user` | User monitoring mode | WebSocket start/stop/frame/status | Uses default simulator params |
| `/detect?role=researcher` | Research monitoring mode | WebSocket start/stop/frame/status | Sends slider params |
| `/detect?mode=researcher` | Research monitoring alias | Same as above | `mode` query is accepted as an alias for `role` |
| `/monitor` | Redirect | None | Redirects to `/detect` |
| `/results` | Report page | None today | `localStorage` profile + hardcoded report metrics |
| `/reports` | Redirect | None | Redirects to `/results` |
| `/history` | History page | None today | Hardcoded history list and trend values |
| `/professional` | Technical page | None today | Static roadmap/status copy |
| `/device` | Redirect | None | Redirects to `/professional` |

## 4. Browser-local data contract

### 4.1 Profile storage

The monitoring page writes the user's profile to browser local storage. The report page reads the same key.

| Field | Value |
|---|---|
| Storage | `localStorage` |
| Key | `sensotelligence_profile` |
| Writer | `MonitorPage.tsx` |
| Reader | `ReportsPage.tsx` |

Shape:

```ts
interface Profile {
  gender: string
  age: string
  height: string
  weight: string
  restingHr: string
  conditions: string[]
  state: string
  note: string
}
```

Default value:

```json
{
  "gender": "未选择",
  "age": "",
  "height": "",
  "weight": "",
  "restingHr": "",
  "conditions": ["无"],
  "state": "静息",
  "note": ""
}
```

Allowed UI values:

| Field | UI values / format |
|---|---|
| `gender` | `未选择`, `男`, `女`, `其他` |
| `age` | Free text input, example `24` |
| `height` | Free text input in cm, example `170` |
| `weight` | Free text input in kg, example `60` |
| `restingHr` | Free text input, example `60-80` |
| `state` | `静息`, `运动后`, `紧张`, `饭后`, `睡前` |
| `conditions` | Multi-select from `高血压`, `心律异常`, `呼吸系统疾病`, `无`, `其他` |
| `note` | Free text |

Backend implication: when report/history APIs are added, either keep accepting this shape or provide a migration path from local profile to server-side profile.

## 5. Current WebSocket API v1

### 5.1 Endpoint

```text
WS /ws
```

Current frontend connects to:

```text
ws://localhost:8000/ws
```

### 5.2 Connection behavior

The frontend:

1. Opens one WebSocket connection when `useWebSocket()` mounts.
2. Sets `connected = true` on `onopen`.
3. Reconnects after 2 seconds on `onclose`.
4. Clears `connected` and `streaming` on close.
5. Closes the socket when the component unmounts.

Backend should tolerate reconnects and should stop or detach any active session when the client disconnects.

### 5.3 Client -> server messages

#### Start session

Current frontend sends a flat message, not the newer `{ config: ... }` structure described in older architecture notes.

```json
{
  "type": "start_session",
  "hr_bpm": 72,
  "rr_bpm": 16,
  "noise_level": 0.05
}
```

TypeScript intent:

```ts
type StartSessionMessage = {
  type: 'start_session'
  hr_bpm: number
  rr_bpm: number
  noise_level: number
}
```

Frontend sources:

| Mode | Call | Sent values |
|---|---|---|
| User mode | `startSession()` | `hr_bpm = 72`, `rr_bpm = 16`, `noise_level = 0.05` |
| Research mode | `startSession(demoHr, demoRr, demoNoise)` | `hr_bpm = 45..120`, `rr_bpm = 8..28`, `noise_level = 0..30` |

Important compatibility note:

- User mode sends `noise_level` as a decimal fraction (`0.05`).
- Research mode currently sends the slider integer directly (`0..30`) even though the label is a percentage.
- A robust backend should normalize both:
  - `0 <= noise_level <= 1`: treat as fraction.
  - `1 < noise_level <= 100`: treat as percentage and divide by `100`.

Recommended normalized request model:

```ts
interface StartSessionRequestV1 {
  type: 'start_session'
  hr_bpm?: number        // default 72
  rr_bpm?: number        // default 16
  noise_level?: number   // accept 0..1 or 0..100 percentage
}
```

Suggested validation after normalization:

| Field | Type | Default | Recommended range | Meaning |
|---|---|---:|---:|---|
| `hr_bpm` | number | `72` | `40..200` | Simulated or requested heart rate |
| `rr_bpm` | number | `16` | `5..60` | Simulated or requested respiration rate |
| `noise_level` | number | `0.05` | `0..0.5` for simulator | Signal noise level |

#### Stop session

```json
{
  "type": "stop_session"
}
```

TypeScript intent:

```ts
type StopSessionMessage = {
  type: 'stop_session'
}
```

#### Ping

The current backend has a `ping` branch, but the current frontend does not send ping messages.

If retained:

```json
{
  "type": "ping"
}
```

Expected response:

```json
{
  "type": "status",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "pong"
  }
}
```

### 5.4 Server -> client messages

The current frontend explicitly handles only these message types:

```ts
type ServerMessage = ServerFrame | ServerStatus | ServerError
```

Unknown message types are ignored by the current code.

#### Frame message

This is the most important current contract. The monitoring UI depends on this message to drive waveforms and derived vitals.

```json
{
  "type": "frame",
  "timestamp": 1234567890.123,
  "payload": {
    "frame_id": 1,
    "signal": 0.12,
    "range_profile": [0.01, 0.02, 0.12],
    "ground_truth": {
      "hr_bpm": 72,
      "rr_bpm": 16
    }
  }
}
```

TypeScript contract:

```ts
interface ServerFrame {
  type: 'frame'
  timestamp: number
  payload: {
    frame_id: number
    signal: number
    range_profile: number[]
    ground_truth: {
      hr_bpm: number
      rr_bpm: number
    }
  }
}
```

Field usage:

| Field | Required for current UI | Usage |
|---|---:|---|
| `type` | Yes | Must equal `frame` |
| `timestamp` | Yes for research mode display | Frontend renders `new Date(timestamp * 1000).toLocaleTimeString()`; therefore timestamp must be Unix seconds, not milliseconds |
| `payload.frame_id` | Preferred | Research mode shows current frame number; falls back to history length if missing |
| `payload.signal` | Yes | Drives waveform, derived heart rate, stability, confidence and demo PPG waveform |
| `payload.range_profile` | Typed as required | Not displayed directly today, but should be included for compatibility and future use |
| `payload.ground_truth.hr_bpm` | Yes for current heart rate display | Used as base value for frontend-derived heart rate |
| `payload.ground_truth.rr_bpm` | Yes for current respiration display | Used directly as frontend-displayed respiration rate |

Recommended cadence:

- Current UI assumes about `20 fps`.
- The hook keeps the last `1000` signal points, which is about `50s @ 20fps`.
- Research mode displays frame rate as static `20 FPS` while streaming; it does not currently read frame rate from backend.

#### Status message

```json
{
  "type": "status",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "started",
    "session_id": "abc123"
  }
}
```

TypeScript contract:

```ts
interface ServerStatus {
  type: 'status'
  timestamp: number
  payload: {
    msg: string
    session_id?: string
    frame_count?: number
  }
}
```

Current frontend behavior:

| `payload.msg` | Frontend behavior |
|---|---|
| `started` | Logged only |
| `stopped` | Sets `streaming = false` |
| `stopped_ok` | Sets `streaming = false` |
| `pong` | Logged only if sent |
| Other strings | Logged only |

Recommended server messages:

Start acknowledgement:

```json
{
  "type": "status",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "started",
    "session_id": "session_20260708_001"
  }
}
```

Stop completion:

```json
{
  "type": "status",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "stopped",
    "session_id": "session_20260708_001",
    "frame_count": 1200
  }
}
```

Or for explicit stop acknowledgement:

```json
{
  "type": "status",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "stopped_ok",
    "session_id": "session_20260708_001",
    "frame_count": 1200
  }
}
```

#### Error message

```json
{
  "type": "error",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "Failed to start session"
  }
}
```

TypeScript contract:

```ts
interface ServerError {
  type: 'error'
  timestamp: number
  payload: {
    msg: string
  }
}
```

Current frontend behavior:

- Logs `payload.msg` to console.
- Does not show a user-facing error state yet.
- Does not automatically set `streaming = false` on `error`.

Backend should still send clear errors because the frontend can later surface them without changing backend behavior.

## 6. Frontend-derived metrics today

The current UI presents several values as if they were monitoring metrics, but they are derived in the frontend from `frame.payload.signal` and `ground_truth`.

Backend should not assume these are real model outputs yet.

| Display | Current formula/source |
|---|---|
| Current heart rate | `groundTruth.hr_bpm + signal * 1.4` |
| Current respiration | `groundTruth.rr_bpm` |
| Stability | If connected and streaming: `clamp(92 - abs(signal) * 16, 62, 97)`; if connected but idle: `76`; else `0` |
| Confidence | If streaming: `clamp(91 - abs(signal) * 12, 70, 96)`; else `0` |
| Frame count | `latestFrame.payload.frame_id ?? signalHistory.length` |
| Elapsed duration | Browser timer from local `startedAt` |
| Demo PPG waveform | Derived from last 360 signal points: `value * 0.28 + sin(index / 8) * 0.12 + sin(index / 25) * 0.04` |
| Research frame latency | Static string `48 ms` while streaming |
| Dropped frames | Static string `0` |
| Research frame rate | Static `20 FPS` while streaming |

Backend development implication:

- The first backend milestone should preserve `frame` messages so current pages keep working.
- The second milestone should add explicit `vital_signs`, `signal_quality`, `ppg_waveform`, `device_status` and `inference_status` events, then update frontend calculations to consume backend values instead of deriving them.

## 7. Backward-compatible WebSocket API v2 target

The technical page explicitly names the next backend events:

- `device_status`
- `vital_signs`
- TI radar adapter / parser status
- model inference status
- report/history storage

Because the current frontend ignores unknown WebSocket message types, the backend can safely start sending these messages in parallel with v1 `frame` messages. The frontend will need a later update to display them.

### 7.1 Recommended server event envelope

Use a consistent envelope for all server events:

```ts
interface ServerEvent<TType extends string, TPayload> {
  type: TType
  timestamp: number // Unix seconds
  session_id?: string
  payload: TPayload
}
```

### 7.2 `device_status`

```json
{
  "type": "device_status",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "connected": true,
    "source": "simulator",
    "frame_rate": 20,
    "dropped_frames": 0,
    "latency_ms": 32,
    "hardware": {
      "vendor": "TI",
      "model": "IWR6843ISK",
      "port": "COM3"
    }
  }
}
```

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `connected` | boolean | Yes | Whether a data source is connected |
| `source` | `'simulator' \| 'ti_mmwave' \| 'file_replay'` | Yes | Current data source |
| `frame_rate` | number | Yes | Current observed FPS |
| `dropped_frames` | number | Yes | Total dropped frames in current session |
| `latency_ms` | number | Yes | Capture-to-event latency |
| `hardware` | object/null | No | Present for real hardware |

### 7.3 `radar_frame`

This is the target semantic replacement for the legacy `frame` event. During migration, send both:

- `frame` for current frontend compatibility.
- `radar_frame` for future frontend.

```json
{
  "type": "radar_frame",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "frame_id": 1,
    "signal": 0.12,
    "range_profile": [0.01, 0.02, 0.12],
    "center_bin": 128,
    "sampling_rate": 20,
    "metadata": {
      "adapter": "simulator"
    }
  }
}
```

### 7.4 `signal_quality`

```json
{
  "type": "signal_quality",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "score": 0.91,
    "level": "good",
    "snr_db": 18.6,
    "motion_artifact": 0.08,
    "reason": "stable_chest_motion"
  }
}
```

Payload:

| Field | Type | Range / values |
|---|---|---|
| `score` | number | `0..1` |
| `level` | string | `poor`, `fair`, `good`, `excellent` |
| `snr_db` | number/null | Optional signal-to-noise ratio |
| `motion_artifact` | number | `0..1` |
| `reason` | string | Human-readable reason/debug label |

### 7.5 `inference_status`

```json
{
  "type": "inference_status",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "ready": true,
    "state": "running",
    "model_name": "radar-vital-net",
    "model_version": "0.1.0",
    "runtime": "mock",
    "latency_ms": 41
  }
}
```

Payload:

| Field | Type | Notes |
|---|---|---|
| `ready` | boolean | Whether model service is ready |
| `state` | string | `idle`, `warming_up`, `running`, `error` |
| `model_name` | string | Model display name |
| `model_version` | string | Version/checkpoint label |
| `runtime` | string | `mock`, `pytorch`, `onnxruntime`, etc. |
| `latency_ms` | number/null | Last inference latency |

### 7.6 `vital_signs`

```json
{
  "type": "vital_signs",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "heart_rate": 76.4,
    "respiration_rate": 16.2,
    "blood_pressure": {
      "systolic": 118,
      "diastolic": 74
    },
    "confidence": 0.93,
    "signal_quality": 0.88,
    "source": "mock_model"
  }
}
```

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `heart_rate` | number/null | Yes | bpm |
| `respiration_rate` | number/null | Yes | breaths/min |
| `blood_pressure.systolic` | number/null | No | mmHg, future model output |
| `blood_pressure.diastolic` | number/null | No | mmHg, future model output |
| `confidence` | number | Yes | `0..1` |
| `signal_quality` | number | Yes | `0..1` |
| `source` | string | Yes | `simulator`, `mock_model`, `dl_model`, etc. |

### 7.7 `ppg_waveform`

```json
{
  "type": "ppg_waveform",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "points": [0.12, 0.18, 0.31, 0.22],
    "sampling_rate": 50,
    "window_s": 8,
    "source": "mock_model"
  }
}
```

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `points` | number[] | Yes | Latest waveform window |
| `sampling_rate` | number | Yes | Hz |
| `window_s` | number | Yes | Window length |
| `source` | string | Yes | `derived`, `mock_model`, `dl_model` |

### 7.8 `health_analysis`

```json
{
  "type": "health_analysis",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "risk_level": "low",
    "summary": "本次记录中心率和呼吸整体平稳。",
    "suggestions": [
      "建议保持相似姿态继续观察趋势。",
      "若出现胸闷、心悸或气促，应使用专业设备复测并咨询医生。"
    ],
    "disclaimer": "仅用于健康状态观察，不作为医疗诊断或治疗依据。"
  }
}
```

Payload:

| Field | Type | Values |
|---|---|---|
| `risk_level` | string | `low`, `medium`, `high`, `unknown` |
| `summary` | string | Short result summary |
| `suggestions` | string[] | Actionable suggestions |
| `disclaimer` | string | Medical disclaimer |

### 7.9 `alert`

```json
{
  "type": "alert",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "severity": "warning",
    "code": "LOW_SIGNAL_QUALITY",
    "title": "信号质量偏低",
    "message": "检测到较明显体动干扰，请保持静止并确认雷达固定。"
  }
}
```

### 7.10 `session_summary`

```json
{
  "type": "session_summary",
  "timestamp": 1234567890.123,
  "session_id": "session_20260708_001",
  "payload": {
    "duration_s": 60,
    "frame_count": 1200,
    "avg_heart_rate": 72.8,
    "avg_respiration_rate": 16.2,
    "avg_signal_quality": 0.91,
    "report_id": "report_20260708_001"
  }
}
```

## 8. REST API contract

The current frontend does not call REST APIs, but `vite.config.ts` already proxies `/api` to the backend. The existing backend also exposes basic REST routes. These endpoints should be kept and expanded so report/history pages can move off hardcoded data.

### 8.1 Existing / compatibility endpoints

#### `GET /api/status`

Purpose: platform/backend status.

Response:

```json
{
  "backend": "running",
  "version": "0.1.0",
  "radar_connected": false,
  "session_active": false
}
```

Recommended expanded response:

```json
{
  "backend": "running",
  "version": "0.1.0",
  "environment": "development",
  "radar_connected": false,
  "session_active": false,
  "model_ready": false,
  "storage_ready": false
}
```

#### `POST /api/session/start`

Purpose: REST alternative for starting a session.

Request should accept both the current flat shape and the future nested config shape.

Flat request:

```json
{
  "hr_bpm": 72,
  "rr_bpm": 16,
  "noise_level": 0.05
}
```

Future request:

```json
{
  "mode": "simulator",
  "profile_id": "profile_local_or_server_id",
  "config": {
    "hr_bpm": 72,
    "rr_bpm": 16,
    "noise_level": 0.05,
    "duration_target_s": 60
  }
}
```

Response:

```json
{
  "session_id": "session_20260708_001",
  "adapter": "simulator",
  "started_at": "2026-07-08T21:42:00+08:00"
}
```

#### `POST /api/session/stop`

Purpose: stop the current session.

Response:

```json
{
  "session_id": "session_20260708_001",
  "duration_s": 60.0,
  "frame_count": 1200
}
```

### 8.2 Device endpoints

#### `GET /api/device/status`

Response:

```json
{
  "connected": true,
  "source": "simulator",
  "frame_rate": 20,
  "dropped_frames": 0,
  "latency_ms": 32,
  "hardware": null
}
```

#### `POST /api/device/connect`

Request:

```json
{
  "source": "ti_mmwave",
  "port": "COM3",
  "baud_rate": 921600
}
```

Response:

```json
{
  "connected": true,
  "source": "ti_mmwave",
  "message": "device connected"
}
```

#### `POST /api/device/configure`

Request:

```json
{
  "frame_rate": 20,
  "range_bins": 256,
  "profile": "vital_signs_default"
}
```

Response:

```json
{
  "ok": true,
  "applied": {
    "frame_rate": 20,
    "range_bins": 256,
    "profile": "vital_signs_default"
  }
}
```

### 8.3 Session endpoints

#### `GET /api/session/{session_id}`

Response:

```json
{
  "session_id": "session_20260708_001",
  "started_at": "2026-07-08T21:42:00+08:00",
  "stopped_at": "2026-07-08T21:43:00+08:00",
  "duration_s": 60,
  "frame_count": 1200,
  "source": "simulator",
  "summary": {
    "avg_heart_rate": 72.8,
    "avg_respiration_rate": 16.2,
    "avg_signal_quality": 0.91,
    "stability": 0.91
  }
}
```

#### `GET /api/sessions`

Purpose: history page data source.

Query params:

| Param | Type | Default |
|---|---|---|
| `limit` | number | `20` |
| `offset` | number | `0` |
| `profile_id` | string | optional |

Response:

```json
{
  "items": [
    {
      "session_id": "session_20260708_001",
      "started_at": "2026-07-08T21:42:00+08:00",
      "mode": "静息检测",
      "status": "整体平稳",
      "advice": "建议继续观察",
      "avg_heart_rate": 72.8,
      "avg_respiration_rate": 16.2,
      "stability": 0.91,
      "report_id": "report_20260708_001"
    }
  ],
  "total": 1
}
```

### 8.4 History vitals endpoint

#### `GET /api/history/vitals`

Purpose: trend chart source for `/history`.

Query params:

| Param | Type | Notes |
|---|---|---|
| `range` | string | `7d`, `30d`, `90d` |
| `profile_id` | string | optional |

Response:

```json
{
  "range": "7d",
  "points": [
    {
      "timestamp": "2026-07-08T21:42:00+08:00",
      "heart_rate": 72.8,
      "respiration_rate": 16.2,
      "stability": 0.91,
      "signal_quality": 0.88
    }
  ],
  "summary": {
    "avg_heart_rate": 72.8,
    "avg_respiration_rate": 16.2,
    "session_count": 3,
    "avg_stability": 0.91
  }
}
```

### 8.5 Reports endpoints

#### `POST /api/analysis/session/{session_id}`

Purpose: generate or refresh health analysis for one session.

Request:

```json
{
  "profile": {
    "gender": "男",
    "age": "24",
    "height": "170",
    "weight": "60",
    "restingHr": "60-80",
    "conditions": ["无"],
    "state": "静息",
    "note": ""
  }
}
```

Response:

```json
{
  "report_id": "report_20260708_001",
  "session_id": "session_20260708_001",
  "risk_level": "low",
  "summary": "本次检测整体平稳。",
  "suggestions": [
    "建议在相似时间、相似姿态和安静环境下继续记录。",
    "若伴随明显不适，应使用专业设备复测并咨询医生。"
  ]
}
```

#### `GET /api/reports/{report_id}`

Purpose: report page source for `/results`.

Response:

```json
{
  "report_id": "report_20260708_001",
  "session_id": "session_20260708_001",
  "created_at": "2026-07-08T21:43:10+08:00",
  "title": "本次检测整体平稳",
  "metrics": {
    "avg_heart_rate": 72,
    "avg_respiration_rate": 16,
    "stability": 91,
    "signal_quality_label": "良好"
  },
  "profile": {
    "gender": "男",
    "age": "24",
    "bmi": "20.8",
    "state": "静息",
    "conditions": ["无"]
  },
  "analysis": {
    "risk_level": "low",
    "summary": "心率与呼吸节律整体平稳，记录过程中信号稳定性较好。",
    "tips": [
      {
        "title": "保持同一检测条件",
        "content": "建议在相似时间、相似姿态和安静环境下记录。"
      },
      {
        "title": "关注趋势而非单次数值",
        "content": "偶尔一次波动不一定代表异常，更建议观察连续多次记录中的变化方向。"
      },
      {
        "title": "不适时及时复测",
        "content": "若伴随明显不适，或心率、呼吸持续偏离平时状态，应使用专业设备复测并咨询医生。"
      }
    ],
    "disclaimer": "本页结果用于日常健康状态观察，不作为医疗诊断或治疗依据。"
  }
}
```

## 9. Error format

Use consistent error bodies for REST:

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found",
    "details": {
      "session_id": "session_20260708_001"
    }
  }
}
```

Recommended HTTP statuses:

| Status | Use case |
|---:|---|
| `400` | Invalid request body or unsupported config |
| `404` | Missing session/report/device resource |
| `409` | Session state conflict, such as starting while another exclusive session is active |
| `422` | Validation error |
| `500` | Internal backend error |
| `503` | Device/model/storage temporarily unavailable |

For WebSocket, send:

```json
{
  "type": "error",
  "timestamp": 1234567890.123,
  "payload": {
    "msg": "Human-readable error",
    "code": "SESSION_START_FAILED"
  }
}
```

The current frontend only requires `payload.msg`; `payload.code` is safe to add.

## 10. Backend implementation priority for the current frontend

1. Keep `WS /ws` compatible with current v1 messages.
2. Normalize `noise_level` so both `0.05` and `5` work.
3. Keep sending `frame` events with `timestamp`, `frame_id`, `signal`, `range_profile`, and `ground_truth`.
4. Send `status.started` and `status.stopped`/`status.stopped_ok` consistently.
5. Add v2 events in parallel: `device_status`, `signal_quality`, `inference_status`, `vital_signs`, `ppg_waveform`, `session_summary`.
6. Add REST data sources for `/results` and `/history`, then update the frontend away from hardcoded values.
7. Move local profile data from `localStorage` to backend profile/session APIs when persistence is needed.

## 11. Known frontend contract mismatches to account for

| Area | Current behavior | Backend recommendation |
|---|---|---|
| Start session shape | Frontend sends flat `hr_bpm`, `rr_bpm`, `noise_level` | Accept flat shape; optionally also accept future `config` |
| Research noise value | Sends `0..30` integer as `noise_level` | Normalize integer percent to fraction |
| Timestamp | Frontend multiplies by `1000` before `Date` | Send Unix seconds, not milliseconds |
| Error handling | UI logs errors only | Send structured errors anyway; frontend can surface later |
| Unknown WS events | Ignored by current frontend | Safe to add new events in parallel |
| Report/history | Static or local only | Add REST endpoints and then wire frontend |
| Vite `/ws` proxy | Configured but hook uses absolute `ws://localhost:8000/ws` | Current backend must listen on `localhost:8000`; later frontend can switch to relative `/ws` |

