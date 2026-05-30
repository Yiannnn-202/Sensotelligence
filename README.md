# Sensotelligence

基于 TI 毫米波雷达的生命体征监测 Web 应用。

> 架构文档: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 快速启动

### 后端 (FastAPI)

```bash
cd backend
pip install -r requirements.txt
PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API 文档: http://localhost:8000/docs

### 前端 (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

浏览器打开: http://localhost:5173

### Docker 一键启动

```bash
docker-compose up
```

## 当前状态

**Phase 0 — 架构骨架**

- [x] FastAPI 后端 + WebSocket 实时推送
- [x] React 前端 + ECharts 实时波形图
- [x] 雷达抽象接口 (RadarInterface)
- [x] 模拟器适配器 (SimulatorAdapter) — 代替真硬件
- [x] WebSocket 协议定义
- [ ] 信号处理算法 (Phase 1)
- [ ] 生命体征提取 (Phase 1)
- [ ] 真实硬件适配器 (Phase 3)

## 项目结构

```
Sensotelligence/
├── backend/            # FastAPI 后端
│   ├── app/
│   │   ├── adapters/   # 雷达适配器 (simulator / hardware)
│   │   ├── api/        # REST + WebSocket
│   │   ├── core/       # 配置 + 抽象接口
│   │   ├── models/     # Pydantic schemas
│   │   └── services/   # 会话管理 + 信号处理
│   └── main.py
├── frontend/           # React 前端
│   └── src/
│       ├── components/ # WaveformChart, VitalCard, SessionControl
│       ├── hooks/      # useWebSocket
│       └── pages/      # MonitorPage
├── docs/               # 技术文档
├── docker-compose.yml
└── ARCHITECTURE.md
```
