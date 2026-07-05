# Sensotelligence — 系统架构文档

> 基于 TI 毫米波雷达的多维度生命体征智能监测平台

---

## 1. 项目概述

Sensotelligence 是一个面向物联网健康监测场景的端到端智能平台，目标是通过 TI 毫米波雷达开发套件实现非接触式生命体征监测，并结合深度学习模型与大模型健康分析能力，形成从硬件感知到智能分析再到长期健康管理的完整流式系统。

平台核心能力包括：

- TI 毫米波雷达硬件数据接入
- 雷达信号流式采集与解析
- 基于深度学习模型的体征反演
- 心率、血压、PPG 波形等多维体征监测
- 信号质量与模型置信度评估
- 基于大模型的健康分析
- 短期异常监测与长期健康管理
- 面向竞赛展示的完整系统链路可视化

---

## 2. 当前实现与目标架构

### 2.1 当前代码状态

当前仓库处于 **Phase 0 — 前后端骨架与模拟数据链路**。

已实现：

- FastAPI 后端
- React + TypeScript 前端
- WebSocket 实时通信
- `RadarInterface` 雷达抽象接口
- `SimulatorAdapter` 模拟雷达数据源
- 监测会话管理
- 实时波形展示
- 采集控制面板

未实现：

- TI 雷达开发套件硬件适配器
- 硬件雷达帧解析
- 深度学习体征监测模型
- 血压、心率、PPG 波形真实推理输出
- 大模型健康分析服务
- 历史健康数据存储
- 长期管理、报告、告警等下游功能

### 2.2 目标系统定位

目标系统不是单纯的前端可视化 demo，而是一个完整的物联网智能健康平台：

```text
硬件感知
  → 数据接入
  → 信号处理
  → 深度学习推理
  → 多维体征输出
  → 大模型健康分析
  → 短期监测
  → 长期健康管理
```

---

## 3. 五层平台架构

```text
┌─────────────────────────────────────────────────────────────┐
│                      应用展示层                              │
│  首页 / 实时监测 / 历史趋势 / 健康报告 / 设备与模型状态       │
└───────────────────────────▲─────────────────────────────────┘
                            │ WebSocket + REST
┌───────────────────────────┴─────────────────────────────────┐
│                      健康智能层                              │
│  大模型健康分析 / 风险解释 / 短期预警 / 长期管理 / 报告生成   │
└───────────────────────────▲─────────────────────────────────┘
                            │ 结构化体征摘要
┌───────────────────────────┴─────────────────────────────────┐
│                      智能推理层                              │
│  SignalPreprocessor / Deep Learning Vital Inference / 后处理 │
└───────────────────────────▲─────────────────────────────────┘
                            │ 雷达时间窗
┌───────────────────────────┴─────────────────────────────────┐
│                      边缘接入层                              │
│  HardwareAdapter / RadarFrameParser / 设备状态 / 数据质量     │
└───────────────────────────▲─────────────────────────────────┘
                            │ USB / UART / 串口
┌───────────────────────────┴─────────────────────────────────┐
│                        感知层                                │
│              TI mmWave Radar Development Kit                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 感知层

感知层由 TI 毫米波雷达开发套件组成，负责采集人体胸腔微动、体表微位移等非接触式雷达信号。

目标能力：

- 雷达设备连接
- 雷达参数配置
- 原始数据流输出
- 帧率、距离门、采样参数管理

### 3.2 边缘接入层

边缘接入层负责把硬件输出转换成平台内部统一数据结构。

目标模块：

```text
backend/app/hardware/
├── hardware_adapter.py
└── radar_frame_parser.py
```

职责：

- 通过 USB/UART/串口读取 TI 雷达数据
- 解析硬件数据帧
- 统一输出 `RadarFrame`
- 统计设备连接状态、帧率、丢帧率、延迟
- 对接模拟器与真实硬件两种数据源

### 3.3 智能推理层

智能推理层是体征监测的核心，负责将雷达信号映射为结构化生命体征。

深度学习模型位置：

```text
RadarFrame
  → Radar Window
  → SignalPreprocessor
  → VitalInferenceService
  → HR / BP / PPG / Confidence
```

推荐目录：

```text
backend/app/
├── processing/
│   └── signal_preprocessor.py
├── ml/
│   ├── model_loader.py
│   ├── preprocess.py
│   ├── inference.py
│   ├── postprocess.py
│   └── checkpoints/
└── services/
    └── vital_inference_service.py
```

`VitalInferenceService` 是模型推理入口。它不直接依赖 API 层，也不直接依赖前端协议，而是只接收处理后的雷达时间窗并返回体征结果。

示例接口：

```python
class VitalInferenceService:
    def predict(self, radar_window):
        return {
            "heart_rate": 76,
            "blood_pressure": {
                "systolic": 118,
                "diastolic": 74
            },
            "ppg_waveform": [0.12, 0.18, 0.31],
            "confidence": 0.93,
            "signal_quality": 0.88
        }
```

### 3.4 健康智能层

健康智能层基于体征推理结果进行分析，不参与每帧实时推理链路，避免阻塞实时监测。

目标模块：

```text
backend/app/services/
├── health_analysis_service.py
├── alert_engine.py
├── history_service.py
└── report_service.py
```

触发方式：

- 监测结束后生成报告
- 体征异常时生成解释
- 用户主动请求 AI 分析
- 每日、每周、每月生成健康摘要

输入不应是原始雷达信号，而应是结构化摘要：

```text
最近 5 分钟：
- 平均心率
- 收缩压 / 舒张压区间
- PPG 稳定性
- 信号质量均值
- 异常次数
- 变化趋势

最近 7 天：
- 静息心率趋势
- 血压变化趋势
- 异常发生时间段
- 风险等级变化
```

### 3.5 应用展示层

应用展示层用于呈现实时监测、智能分析和竞赛展示。

推荐页面：

| 页面 | 功能 |
|---|---|
| `/` | 平台首页，展示项目背景、技术路线、系统亮点 |
| `/monitor` 或 `/dashboard` | 实时监测中心，展示设备状态、体征、PPG、信号质量、AI 分析 |
| `/history` | 长期趋势，展示历史会话和体征变化 |
| `/reports` | 健康报告，展示短期分析、长期建议、导出结果 |
| `/device` | 设备与模型状态，展示雷达连接、模型版本、推理延迟 |

---

## 4. 目标数据流

```text
TI mmWave Radar
      │
      │ USB / UART / Serial
      ▼
HardwareAdapter
      │
      │ raw bytes / hardware packet
      ▼
RadarFrameParser
      │
      │ RadarFrame
      ▼
MonitoringSession
      │
      │ sliding radar window
      ▼
SignalPreprocessor
      │
      │ model input tensor
      ▼
VitalInferenceService
      │
      │ HR / BP / PPG / confidence
      ▼
WebSocket Event Bus
      │
      ├── vital_signs
      ├── ppg_waveform
      ├── signal_quality
      ├── inference_status
      └── alert
      │
      ▼
React Dashboard
      │
      ▼
HealthAnalysisService
      │
      ▼
Reports / Alerts / Long-term Management
```

---

## 5. 核心后端模块设计

### 5.1 `RadarInterface`

统一模拟器和真实硬件输入。

```python
class RadarInterface(ABC):
    async def connect(self, config: dict | None = None) -> bool:
        ...

    async def start_stream(self) -> AsyncIterator[RadarFrame]:
        ...

    async def stop(self) -> None:
        ...
```

### 5.2 `SimulatorAdapter`

当前已实现。用于在无硬件阶段模拟雷达波形，支撑前后端联调。

后续应扩展为可模拟：

- 心率
- 血压趋势
- PPG 波形
- 信号质量变化
- 运动干扰
- 异常片段

### 5.3 `HardwareAdapter`

目标新增。负责连接 TI 雷达开发套件。

职责：

- 打开串口或 USB 连接
- 写入雷达配置
- 读取实时数据流
- 处理断连与重连
- 输出硬件原始数据包

### 5.4 `RadarFrameParser`

目标新增。负责将 TI 硬件输出解析为平台统一帧结构。

```python
@dataclass
class RadarFrame:
    timestamp: float
    frame_id: int
    range_profile: list[float]
    raw_payload: bytes | None
    metadata: dict
```

### 5.5 `SignalPreprocessor`

目标新增。负责把雷达帧序列转换为模型输入。

职责：

- 滑动窗口切片
- 去噪
- 归一化
- 缺失帧处理
- 运动伪影标记
- 转换为模型输入张量

### 5.6 `VitalInferenceService`

目标新增。深度学习模型推理入口。

输入：

```text
radar_window 或 model_input_tensor
```

输出：

```text
heart_rate
systolic_bp
diastolic_bp
ppg_waveform
confidence
signal_quality
```

该模块应与 WebSocket 解耦，方便后续替换模型、独立测试和性能优化。

### 5.7 `HealthAnalysisService`

目标新增。负责调用大模型生成健康分析。

设计原则：

- 不在每一帧调用
- 不阻塞实时推理链路
- 基于结构化体征摘要分析
- 输出可解释、可展示、可追踪的健康建议

### 5.8 `AlertEngine`

目标新增。负责异常监测。

告警来源：

- 体征阈值异常
- 短时间剧烈变化
- 信号质量过低
- 模型置信度过低
- 设备断连

---

## 6. WebSocket 事件协议

当前协议只支持 `frame`、`status`、`error`。目标协议应扩展为面向实时系统的事件流。

### 6.1 上行消息

```typescript
type ClientMessage =
  | { type: "start_session"; config: SessionConfig }
  | { type: "stop_session" }
  | { type: "set_device_param"; param: string; value: number | string }
  | { type: "request_health_analysis"; session_id: string }
  | { type: "ping" };
```

### 6.2 下行消息

```typescript
type ServerMessage =
  | DeviceStatusMessage
  | RadarFrameMessage
  | SignalQualityMessage
  | InferenceStatusMessage
  | VitalSignsMessage
  | PpgWaveformMessage
  | HealthAnalysisMessage
  | AlertMessage
  | SessionSummaryMessage
  | ErrorMessage;
```

### 6.3 设备状态

```json
{
  "type": "device_status",
  "timestamp": 1234567890,
  "payload": {
    "connected": true,
    "source": "ti_mmwave",
    "frame_rate": 20,
    "dropped_frames": 0,
    "latency_ms": 32
  }
}
```

### 6.4 体征结果

```json
{
  "type": "vital_signs",
  "timestamp": 1234567890,
  "payload": {
    "heart_rate": 76,
    "blood_pressure": {
      "systolic": 118,
      "diastolic": 74
    },
    "confidence": 0.93,
    "signal_quality": 0.88
  }
}
```

### 6.5 PPG 波形

```json
{
  "type": "ppg_waveform",
  "timestamp": 1234567890,
  "payload": {
    "points": [0.12, 0.18, 0.31, 0.22],
    "sampling_rate": 50,
    "window_s": 8
  }
}
```

### 6.6 模型推理状态

```json
{
  "type": "inference_status",
  "timestamp": 1234567890,
  "payload": {
    "model_name": "radar-vital-net",
    "model_version": "0.1.0",
    "runtime": "onnxruntime",
    "latency_ms": 41,
    "ready": true
  }
}
```

### 6.7 健康分析

```json
{
  "type": "health_analysis",
  "timestamp": 1234567890,
  "payload": {
    "risk_level": "low",
    "summary": "过去 5 分钟内心率和血压处于平稳区间。",
    "suggestions": [
      "继续保持静息监测 2 分钟以获得更稳定趋势。",
      "建议结合历史血压记录进行长期评估。"
    ]
  }
}
```

---

## 7. REST API 规划

当前接口：

| Method | Path | 说明 |
|---|---|---|
| `GET` | `/api/status` | 后端状态 |
| `POST` | `/api/session/start` | 开启模拟监测会话 |
| `POST` | `/api/session/stop` | 停止监测会话 |
| `WS` | `/ws` | WebSocket 实时数据通道 |

目标接口：

| Method | Path | 说明 |
|---|---|---|
| `GET` | `/api/status` | 平台状态 |
| `GET` | `/api/device/status` | 雷达设备状态 |
| `POST` | `/api/device/connect` | 连接硬件设备 |
| `POST` | `/api/device/configure` | 下发雷达配置 |
| `POST` | `/api/session/start` | 开启监测会话 |
| `POST` | `/api/session/stop` | 停止监测会话 |
| `GET` | `/api/session/{id}` | 查询会话详情 |
| `GET` | `/api/history/vitals` | 查询历史体征 |
| `POST` | `/api/analysis/session/{id}` | 生成会话健康分析 |
| `GET` | `/api/reports/{id}` | 查询健康报告 |
| `WS` | `/ws` | 实时事件通道 |

---

## 8. 数据存储设计

为支持长期健康管理，建议新增持久化存储。比赛阶段可优先使用 SQLite，后续可迁移到 PostgreSQL。

核心实体：

```text
UserProfile
MonitoringSession
VitalRecord
PpgSegment
HealthReport
AlertRecord
DeviceLog
ModelInferenceLog
```

### 8.1 `UserProfile`

用户基础信息和健康管理上下文。

字段示例：

```text
id
name
age
gender
height
weight
baseline_bp
baseline_hr
created_at
```

### 8.2 `MonitoringSession`

一次监测会话。

```text
id
user_id
source
started_at
stopped_at
duration_s
frame_count
avg_signal_quality
summary_status
```

### 8.3 `VitalRecord`

结构化体征时间序列。

```text
id
session_id
timestamp
heart_rate
systolic_bp
diastolic_bp
confidence
signal_quality
```

### 8.4 `PpgSegment`

PPG 波形片段。

```text
id
session_id
start_time
sampling_rate
points
quality
```

### 8.5 `HealthReport`

大模型健康分析结果。

```text
id
session_id
report_type
risk_level
summary
suggestions
created_at
```

---

## 9. 前端产品架构

前端应从当前的双页面原型升级为参赛级产品界面。

### 9.1 首页

目标：让评委快速理解项目创新点和完整链路。

内容建议：

- 项目定位：非接触式多维生命体征智能监测平台
- 技术路线：雷达硬件 → 深度学习 → 大模型健康分析
- 系统链路可视化
- 核心能力：血压、心率、PPG、健康报告、长期管理
- 硬件结合：TI 毫米波雷达开发套件
- 竞赛亮点：IoT 流式系统、AI 体征反演、智能分析闭环

### 9.2 实时监测中心

目标：证明系统能运行。

核心区块：

- 设备在线状态
- 雷达帧率与延迟
- 模型推理状态
- 心率卡片
- 血压卡片
- PPG 实时波形
- 雷达信号质量
- 置信度
- AI 健康分析摘要
- 告警区域

### 9.3 长期健康管理

目标：体现下游功能和项目工作量。

核心区块：

- 历史会话列表
- 心率趋势
- 血压趋势
- PPG 稳定性
- 异常记录
- 周期性健康摘要

### 9.4 设备与模型状态

目标：体现硬件和模型工程能力。

核心区块：

- 雷达连接状态
- 串口 / USB 参数
- 帧率、丢帧、延迟
- 模型版本
- 推理运行时
- 推理延迟
- 最近错误日志

---

## 10. 当前目录与目标目录对照

当前目录：

```text
backend/app/
├── adapters/
│   └── simulator_adapter.py
├── api/
│   ├── routes.py
│   └── websocket.py
├── core/
│   ├── config.py
│   └── radar_interface.py
├── models/
│   └── schemas.py
└── services/
    └── session_manager.py
```

目标目录：

```text
backend/app/
├── adapters/
│   ├── simulator_adapter.py
│   └── hardware_adapter.py
├── api/
│   ├── routes.py
│   └── websocket.py
├── core/
│   ├── config.py
│   └── radar_interface.py
├── hardware/
│   └── radar_frame_parser.py
├── processing/
│   └── signal_preprocessor.py
├── ml/
│   ├── model_loader.py
│   ├── preprocess.py
│   ├── inference.py
│   ├── postprocess.py
│   └── checkpoints/
├── models/
│   ├── schemas.py
│   └── vital_types.py
├── services/
│   ├── session_manager.py
│   ├── vital_inference_service.py
│   ├── health_analysis_service.py
│   ├── alert_engine.py
│   ├── history_service.py
│   ├── report_service.py
│   └── device_status_service.py
└── storage/
    └── database.py
```

---

## 11. 开发阶段规划

| Phase | 目标 | 关键产出 | 演示效果 |
|---|---|---|---|
| Phase 0 | 骨架搭建 | 前后端联通、WebSocket、模拟雷达流 | 浏览器显示实时模拟波形 |
| Phase 1 | 平台化 UI | 首页、监测中心、设备状态、模拟体征 | 形成完整竞赛展示界面 |
| Phase 2 | 模型接口 | 推理服务抽象、mock 模型、体征事件协议 | 前端显示心率、血压、PPG 和置信度 |
| Phase 3 | 大模型分析 | 健康分析服务、报告生成、告警解释 | 生成短期健康分析和建议 |
| Phase 4 | 硬件接入 | TI 雷达适配器、数据解析、设备状态 | 雷达数据进入后端链路 |
| Phase 5 | 模型部署 | 部署真实深度学习模型 | 雷达信号输出真实体征 |
| Phase 6 | 长期管理 | 数据库、历史趋势、健康档案 | 展示长期健康管理闭环 |

---

## 12. 架构原则

| 原则 | 说明 |
|---|---|
| 软硬件解耦 | 通过 `RadarInterface` 隔离模拟器与真实雷达 |
| 模型解耦 | 深度学习模型封装在 `VitalInferenceService` 与 `ml/` 中，不写进 API 路由 |
| 流式优先 | 雷达数据、体征结果、状态事件均通过 WebSocket 实时推送 |
| 分层分析 | 实时推理与大模型健康分析分离，避免阻塞采集链路 |
| 可观测性 | 前端展示设备状态、信号质量、模型置信度、推理延迟 |
| 渐进落地 | 无硬件时使用模拟器和 mock 模型，后续无缝替换真实模块 |
| 竞赛表达 | 页面不仅能运行，还要清晰展示完整技术路线和工程工作量 |

---

## 13. 关键实现建议

1. **先定义体征事件协议**  
   前端不应依赖模拟器字段，而应依赖 `vital_signs`、`ppg_waveform`、`signal_quality` 等目标事件。

2. **先做 mock 模型服务**  
   在真实深度学习模型部署前，用 mock 输出心率、血压、PPG、置信度，保证前端和后端链路完整。

3. **再接入真实模型**  
   将 mock 模型替换为 PyTorch 或 ONNX Runtime 推理，不改前端协议。

4. **硬件接入与模型推理解耦**  
   硬件只负责产生统一雷达帧，模型只负责处理雷达窗口。

5. **大模型分析异步化**  
   大模型分析在会话结束或异常触发时执行，不能卡住实时监测。

6. **前端优先体现完整系统**  
   即使部分能力先用模拟数据，也要在 UI 上展示硬件状态、模型状态、体征结果、健康分析、长期趋势的完整闭环。
