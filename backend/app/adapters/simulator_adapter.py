"""模拟雷达适配器 — Phase 0-2 的核心数据源

用一个简化的数学模型生成类似雷达提取的相位信号：
    φ(t) = A_r·sin(2π·f_r·t) + A_h·sin(2π·f_h·t) + noise

其中：
    f_r = 呼吸频率 (Hz)，f_h = 心率 (Hz)
    A_r 较大 (呼吸导致胸腔位移大)，A_h 较小 (心跳位移微弱)

在真实雷达中，这个 φ(t) 来自距离门内的相位解调。
这里直接模拟相位信号，放入 range_profile 的中间 bin。

帧率: 20 fps，每帧产出一个 RadarFrame。
"""

import asyncio
import math
import random
import time
from typing import AsyncIterator

from app.core.radar_interface import RadarFrame, RadarInterface


class SimulatorAdapter(RadarInterface):
    def __init__(self):
        self._running = False
        self._frame_id = 0
        self._start_time = 0.0

        # 可调参数
        self.hr_bpm = 72.0
        self.rr_bpm = 16.0
        self.noise_level = 0.05
        self.frame_rate = 20       # fps
        self.range_bins = 256

    async def connect(self, config: dict | None = None) -> bool:
        if config:
            self.hr_bpm = config.get("hr_bpm", self.hr_bpm)
            self.rr_bpm = config.get("rr_bpm", self.rr_bpm)
            self.noise_level = config.get("noise_level", self.noise_level)
        return True

    async def start_stream(self) -> AsyncIterator[RadarFrame]:
        self._running = True
        self._frame_id = 0
        self._start_time = time.time()

        interval = 1.0 / self.frame_rate

        while self._running:
            t = time.time() - self._start_time
            frame = self._generate_frame(t)
            yield frame
            self._frame_id += 1
            await asyncio.sleep(interval)

    async def stop(self) -> None:
        self._running = False

    # ── internal ──────────────────────────────────────

    def _generate_frame(self, t: float) -> RadarFrame:
        """生成一帧包含呼吸+心跳调制的模拟数据"""

        # 呼吸: 0.1-0.5 Hz，胸腔位移 ~1-12 mm
        f_r = self.rr_bpm / 60.0
        resp_amp = 0.6              # 相对幅度
        resp_signal = resp_amp * math.sin(2 * math.pi * f_r * t)

        # 心跳: 0.8-2.0 Hz，胸腔位移 ~0.1-0.5 mm
        f_h = self.hr_bpm / 60.0
        heart_amp = 0.15            # 约呼吸幅度的 1/4
        heart_signal = heart_amp * math.sin(2 * math.pi * f_h * t)

        # 合成相位信号
        phase = resp_signal + heart_signal

        # 加高斯噪声
        noise = random.gauss(0, self.noise_level)
        phase += noise

        # 构造 range_profile: 信号落在中间的距离门
        profile = [random.gauss(0, self.noise_level * 0.3) for _ in range(self.range_bins)]
        center_bin = self.range_bins // 2
        profile[center_bin] = phase

        return RadarFrame(
            timestamp=time.time(),
            range_profile=profile,
            metadata={
                "frame_id": self._frame_id,
                "adapter": "simulator",
                "center_bin": center_bin,
                "ground_truth": {
                    "hr_bpm": self.hr_bpm,
                    "rr_bpm": self.rr_bpm,
                },
            },
        )
