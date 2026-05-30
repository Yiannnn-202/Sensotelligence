"""雷达数据源抽象接口 — 软硬件解耦的核心边界"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import AsyncIterator


@dataclass
class RadarFrame:
    """单帧雷达数据

    所有适配器（模拟器 / 真实硬件）统一输出此结构，
    下游处理链不感知数据来源。
    """
    timestamp: float                        # Unix 时间戳 (秒)
    range_profile: list[float] = field(default_factory=list)  # 距离维轮廓 ([0] * N)
    metadata: dict = field(default_factory=dict)              # {frame_id, adapter_name, ...}


class RadarInterface(ABC):
    """雷达数据源抽象基类

    约定：
    - connect()  → start_stream() → stop()
    - start_stream() 返回的异步迭代器由调用方消费
    - 每种适配器自行管理内部状态
    """

    @abstractmethod
    async def connect(self, config: dict | None = None) -> bool:
        """建立连接，返回是否成功。config 为适配器特定参数。"""
        ...

    @abstractmethod
    async def start_stream(self) -> AsyncIterator[RadarFrame]:
        """开始采集，返回异步迭代器，持续产出 RadarFrame。"""
        ...

    @abstractmethod
    async def stop(self) -> None:
        """停止采集，释放资源。"""
        ...
