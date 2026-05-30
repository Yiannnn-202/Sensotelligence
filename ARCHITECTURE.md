# Sensotelligence — 架构文档

> 基于 TI 毫米波雷达的生命体征监测 Web 应用

---

## 1. 项目概述

通过 TI 毫米波雷达采集人体微动信号，经信号处理算法实时提取心跳、呼吸等生命体征，在浏览器端可视化展示并提供交互控制。

### 当前状态

- **开发阶段**：Phase 0（骨架搭建），无实机雷达
- **部署模式**：模式 A — 一体机（雷达 + 后端 + 前端同机运行）
- **雷达型号**：待定（TI IWR 系列）

---

## 2. 系统架构

```
模式 A — 一体机部署

┌────────────────────────────────────────────────────────┐
│                     开发机 / Mini-PC                     │
│                                                        │
│  ┌──────────┐   USB/UART    ┌───────────────────────┐  │
│  │ TI Radar │──────────────▶│   后端 (FastAPI)       │  │
│  │          │               │                       │  │
│  │ (待定)   │  RadarFrame   │  ┌─────────────────┐  │  │
│  └──────────┘   流式输入     │  │ RadarInterface  │  │  │
│                             │  │ (抽象接口)       │  │  │
│          ┌─────────────────▶│  │  ├─ Simulator    │  │  │
│          │  开发阶段用       │  │  └─ Hardware     │  │  │
│          │  SimulatorAdapter │  └────────┬────────┘  │  │
│          │  替代真硬件        │           │           │  │
│                             │  ┌────────▼────────┐  │  │
│                             │  │ SignalProcessor │  │  │
│                             │  │ 生命体征提取算法  │  │  │
│                             │  └────────┬────────┘  │  │
│                             │           │           │  │
│                             │  ┌────────▼────────┐  │  │
│                             │  │ WS / REST API   │──┼──┤
│                             │  └─────────────────┘  │  │
│                             └───────────────────────┘  │
│                                      │                 │
│                              WebSocket + HTTP          │
│                                      │                 │
│                             ┌────────▼────────┐        │
│                             │  前端 (React)    │        │
│                             │  localhost:5173  │        │
│                             │                  │        │
│                             │  ┌────────────┐  │        │
│                             │  │ 实时波形图   │  │        │
│                             │  │ 体征数值卡片 │  │        │
│                             │  │ 采集控制面板 │  │        │
│                             │  └────────────┘  │        │
│                             └───────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 核心设计原则

| 原则 | 说明 |
|------|------|
| **软硬件解耦** | `RadarInterface` 抽象层隔离硬件差异；模拟器和真硬件实现同一接口，开发/测试/部署随意切换 |
| **流式优先** | 雷达数据是连续时间序列，WebSocket 全双工通道承载数据推送 + 控制指令 |
| **算法可插拔** | 信号处理模块独立于 API 层，可单独调试、对模拟信号做对标验证 |
| **渐进式交付** | 每个 Phase 都有可运行、可演示的产出，不等到最后才集成 |

---

## 3. 技术栈

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| **后端框架** | Python 3.11+ / FastAPI | 异步原生支持、WebSocket 开箱即用、自动 OpenAPI 文档 |
| **信号处理** | NumPy, SciPy | 算法原型开发快，与 TI Toolbox 参考代码生态一致 |
| **实时通信** | WebSocket (FastAPI 内置) | 双向低延迟，适合传感器流式数据 |
| **前端框架** | React 18 + TypeScript | 生态成熟，实时数据可视化组件丰富 |
| **图表库** | ECharts / Recharts | 大数据量实时波形渲染性能好 |
| **前端构建** | Vite | 开发热更新快 |
| **容器化** | Docker + docker-compose | 一键启动前后端，将来无缝迁移到 Mini-PC |

---

## 4. 项目结构

```
Sensotelligence/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # REST API (session, config, status)
│   │   │   └── websocket.py         # WebSocket endpoint (实时数据推送)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # 配置管理 (环境变量/Settings)
│   │   │   └── radar_interface.py   # 雷达抽象接口 (ABC)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── signal_processor.py  # 信号处理引擎 (FFT/滤波/CFAR)
│   │   │   ├── vital_signs.py       # 生命体征提取 (HR/RR/HRV)
│   │   │   └── session_manager.py   # 监控会话生命周期管理
│   │   ├── adapters/
│   │   │   ├── __init__.py
│   │   │   ├── simulator_adapter.py # 🎯 模拟雷达数据源 (Phase 0-2)
│   │   │   └── hardware_adapter.py  # 🔌 真实硬件适配器 (Phase 3, 占位)
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py           # Pydantic 数据模型
│   ├── tests/
│   │   ├── test_signal_processor.py
│   │   └── test_vital_signs.py
│   ├── main.py                      # FastAPI 入口
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/           # 主仪表盘布局
│   │   │   ├── WaveformChart/       # 实时波形组件
│   │   │   ├── VitalCard/           # 体征数值卡片 (HR/RR)
│   │   │   ├── SessionControl/      # 开始/停止采集
│   │   │   └── AlertPanel/          # 异常告警
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts      # WebSocket 连接 & 自动重连
│   │   │   └── useVitalSigns.ts     # 体征数据状态管理
│   │   ├── services/
│   │   │   └── api.ts               # HTTP API 封装
│   │   ├── pages/
│   │   │   └── MonitorPage.tsx      # 主监测页面
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docs/
│   └── radar-datasheet/             # 雷达技术文档 (日后上传)
│
├── docker-compose.yml               # 一键启动
├── ARCHITECTURE.md                  # 本文件
└── README.md
```

---

## 5. 核心接口设计

### 5.1 雷达抽象接口 (`RadarInterface`)

```python
from abc import ABC, abstractmethod
from typing import AsyncIterator
from dataclasses import dataclass
import numpy as np

@dataclass
class RadarFrame:
    """单帧雷达数据"""
    timestamp: float
    range_profile: np.ndarray      # 距离维 FFT 结果
    doppler_spectrum: np.ndarray   # 多普勒维 FFT 结果 (如果有)
    metadata: dict                 # 帧序号、天线配置等

class RadarInterface(ABC):
    """所有雷达数据源的统一抽象"""

    @abstractmethod
    async def connect(self, config: dict) -> bool:
        """建立连接，返回是否成功"""
        ...

    @abstractmethod
    async def start_stream(self) -> AsyncIterator[RadarFrame]:
        """返回异步迭代器，持续产出雷达帧"""
        ...

    @abstractmethod
    async def stop(self) -> None:
        """停止采集，释放资源"""
        ...
```

### 5.2 模拟器适配器 (`SimulatorAdapter`)

```python
class SimulatorAdapter(RadarInterface):
    """
    生成带已知生命体征参数的模拟雷达信号。

    核心机制：
    - 用数学模型生成距离-多普勒矩阵，叠加呼吸/心跳引起的相位调制
    - 噪声水平可调，用于测试算法的鲁棒性
    - 输出的 RadarFrame 格式与真实硬件完全一致
    - 构造参数 (hr, rr) 作为 ground truth，用于算法对标验证
    """
```

### 5.3 WebSocket 消息协议

```typescript
// 上行 (前端 → 后端): 控制指令
type ClientMessage =
  | { type: "start_session"; config: SessionConfig }
  | { type: "stop_session" }
  | { type: "set_param"; param: string; value: number };

// 下行 (后端 → 前端): 数据推送
type ServerMessage =
  | { type: "frame"; ts: number; data: number[] }
  | { type: "vital_signs"; hr: number; rr: number; ts: number }
  | { type: "alert"; level: "info" | "warn"; msg: string }
  | { type: "error"; msg: string };
```

### 5.4 REST API (概览)

| Method | Path | 说明 |
|--------|------|------|
| `GET` | `/api/status` | 后端状态、雷达连接状态 |
| `POST` | `/api/session/start` | 开启监测会话 |
| `POST` | `/api/session/stop` | 停止监测会话 |
| `GET` | `/api/session/:id` | 查询历史会话数据 |
| `WS` | `/ws` | WebSocket 实时数据通道 |

---

## 6. 数据流

```
SimulatorAdapter               SignalProcessor            VitalSigns
(模拟雷达帧)                    (信号处理链)               (特征提取)
     │                              │                        │
     │  RadarFrame (每帧 ~50ms)      │                        │
     ├─────────────────────────────▶│                        │
     │  - range_profile (距离FFT)    │  Range-gate selection  │
     │  - doppler_spectrum          │  (选择人体所在距离门)    │
     │                              │                        │
     │                              │  Phase unwrapping      │
     │                              │  Bandpass filter       │
     │                              │  (呼吸 0.1-0.5 Hz)     │
     │                              │  (心跳 0.8-2.0 Hz)     │
     │                              │                        │
     │                              │  Filtered signals      │
     │                              ├───────────────────────▶│
     │                              │                        │  FFT peak detection
     │                              │                        │  → RR (breaths/min)
     │                              │                        │  → HR (beats/min)
     │                              │                        │
     │                              │              VitalSigns │
     │                              │◀───────────────────────┤
     │                              │                        │
     │                     WebSocket │  push                  │
     │              (vital_signs msg)│                        │
     │                              └──────────┬─────────────┘
     │                                         │
     │                                    ┌────▼────┐
     │                                    │  前端    │
     │                                    │  ECharts │
     │                                    │  实时刷新 │
     │                                    └─────────┘
```

---

## 7. 开发阶段

| Phase | 目标 | 关键产出 | 可演示内容 |
|-------|------|----------|-----------|
| **0 — 骨架** | 项目初始化、前后端联通 | 后端 Hello World、前端骨架、WebSocket 握手、模拟器发随机数 | 浏览器能看到一条变化的曲线 |
| **1 — 算法** | 信号处理链 + 体征提取 | Simulator 生成逼真雷达信号、算法提取 HR/RR、单测对标 ground truth | 跑测试脚本，算法输出的 HR/RR 接近模拟器的预设值 |
| **2 — 集成** | 前后端完整对接 | 实时波形显示、体征数值卡片、采集控制面板、历史会话回放 | 在浏览器打开，能看到模拟的"呼吸波形"和"心跳数值"动态变化 |
| **3 — 硬件** | 接入真实雷达 | 实现 HardwareAdapter、调参、实地测试 | 真人在雷达前，网页显示实际生命体征 |

---

## 8. 关键约定

1. **所有时间序列数据统一用 `numpy.ndarray` + `float64`**，跨模块传递避免类型转换开销
2. **帧率约定**：雷达帧率 20 fps（50ms/帧），生命体征更新率 1 Hz（每秒输出一次 HR/RR）
3. **模拟器驱动算法开发**：在 Simulator 里预设 HR=72, RR=16，算法输出的误差作为开发阶段的验收标准
4. **Git 分支策略**：`main` 保持可运行，功能在 `feature/*` 分支开发，PR 合入
5. **雷达文档**放到 `docs/radar-datasheet/`，等型号确定后上传，作为 HardwareAdapter 实现依据
