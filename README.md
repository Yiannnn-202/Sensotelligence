# Sensotelligence

基于 TI 毫米波雷达的多维度生命体征智能监测平台。

Sensotelligence 面向非接触式健康监测场景，目标是打通 **毫米波雷达硬件接入 → 雷达信号流式处理 → 深度学习体征反演 → 大模型健康分析 → 短期监测与长期管理** 的完整物联网闭环。

> 架构文档: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 项目定位

本项目是面向全国物联网设计大赛的参赛作品原型，重点展示一个与硬件深度结合的智能健康监测系统。

平台计划通过 TI 毫米波雷达开发套件采集人体微动雷达信号，并利用深度学习模型将雷达信号映射为多维生命体征，包括：

- 心率
- 血压
- PPG 波形
- 体征置信度与信号质量

在体征监测结果之上，平台进一步接入大模型健康分析能力，实现：

- 短期异常监测
- 健康风险解释
- 个性化健康建议
- 长期趋势管理
- 监测报告生成

---

## 当前状态

**当前代码阶段：Phase 0 — 前后端骨架与模拟数据链路**

已经完成：

- FastAPI 后端
- React + Vite 前端
- WebSocket 实时通信
- 雷达抽象接口 `RadarInterface`
- 模拟雷达适配器 `SimulatorAdapter`
- 实时波形展示
- 采集控制面板

尚未完成：

- TI 雷达开发套件硬件接入
- 雷达原始数据解析
- 深度学习体征反演模型部署
- 血压、心率、PPG 的真实模型输出
- 大模型健康分析服务
- 历史健康管理与报告系统

当前前端展示的波形来自模拟器，心率和呼吸率 Ground Truth 是模拟器预设值，不代表真实算法推理结果。

---

## 目标系统链路

```text
TI mmWave Radar
      ↓
Hardware Adapter
      ↓
Radar Frame Parser
      ↓
Signal Preprocessor
      ↓
Deep Learning Vital Inference
      ↓
HR / BP / PPG / Confidence
      ↓
WebSocket Event Stream
      ↓
Real-time Monitoring Dashboard
      ↓
LLM Health Analysis
      ↓
Alerts / Reports / Long-term Health Management
```

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 后端框架 | Python 3.11+ / FastAPI |
| 实时通信 | WebSocket |
| 雷达接入 | TI 毫米波雷达开发套件，USB/UART/串口数据流 |
| 数据处理 | NumPy / SciPy |
| 模型推理 | 深度学习模型，计划支持 PyTorch / ONNX Runtime |
| 健康分析 | 大模型分析服务 |
| 前端框架 | React 18 + TypeScript |
| 图表可视化 | ECharts |
| 前端构建 | Vite |
| 容器化 | Docker / docker-compose |

---

## 推荐信息架构

后续前端重构时，平台建议拆分为以下页面：

| 页面 | 作用 |
|---|---|
| `/` | 平台首页，展示项目定位、技术路线、竞赛亮点 |
| `/dashboard` 或 `/monitor` | 实时监测中心，展示设备状态、体征、PPG、信号质量 |
| `/history` | 长期健康管理，展示历史趋势和会话记录 |
| `/reports` | 健康报告，展示短期分析和长期建议 |
| `/device` | 设备与模型状态，展示雷达连接、帧率、模型版本、推理延迟 |

---

## 项目结构

```text
Sensotelligence/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── adapters/
│       │   └── simulator_adapter.py
│       ├── api/
│       │   ├── routes.py
│       │   └── websocket.py
│       ├── core/
│       │   ├── config.py
│       │   └── radar_interface.py
│       ├── models/
│       │   └── schemas.py
│       └── services/
│           └── session_manager.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── App.tsx
│       └── main.tsx
│
├── Docs/
│   └── TI/
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md
```

目标架构中还会逐步增加：

```text
backend/app/
├── hardware/
│   ├── hardware_adapter.py
│   └── radar_frame_parser.py
├── processing/
│   └── signal_preprocessor.py
├── ml/
│   ├── model_loader.py
│   ├── inference.py
│   ├── preprocess.py
│   ├── postprocess.py
│   └── checkpoints/
├── services/
│   ├── vital_inference_service.py
│   ├── health_analysis_service.py
│   ├── alert_engine.py
│   ├── history_service.py
│   └── device_status_service.py
└── storage/
    └── database.py
```

---

## 快速启动

### 后端

```bash
cd backend
pip install -r requirements.txt
PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API 文档：

```text
http://localhost:8000/docs
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

浏览器打开：

```text
http://localhost:5173
```

### Docker

```bash
docker-compose up
```

---

## 当前 WebSocket 能力

当前前端通过 WebSocket 连接后端：

```text
ws://localhost:8000/ws
```

当前支持的上行消息：

```json
{
  "type": "start_session",
  "hr_bpm": 72,
  "rr_bpm": 16,
  "noise_level": 0.05
}
```

当前支持的下行消息主要是模拟雷达帧：

```json
{
  "type": "frame",
  "timestamp": 1234567890,
  "payload": {
    "frame_id": 1,
    "signal": 0.12,
    "range_profile": [],
    "ground_truth": {
      "hr_bpm": 72,
      "rr_bpm": 16
    }
  }
}
```

后续将扩展为完整事件流：

```text
device_status
radar_frame
signal_quality
inference_status
vital_signs
ppg_waveform
health_analysis
alert
session_summary
```

---

## 后续开发重点

1. **硬件接入**：实现 TI 雷达开发套件数据读取与配置管理。
2. **数据解析**：将串口或 USB 数据解析为统一雷达帧。
3. **模型推理**：部署深度学习模型，输出心率、血压、PPG 波形和置信度。
4. **实时事件流**：统一 WebSocket 消息协议，支持设备、模型、体征、告警多类事件。
5. **健康分析**：基于结构化体征摘要调用大模型生成健康解释与建议。
6. **长期管理**：持久化用户档案、监测会话、体征记录、分析报告。
7. **前端重构**：升级为医疗科技风格的实时监测 dashboard 与竞赛展示门户。
