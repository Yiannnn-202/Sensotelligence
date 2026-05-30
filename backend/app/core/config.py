"""应用配置管理"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Sensotelligence"
    app_version: str = "0.1.0"
    debug: bool = True

    # 雷达配置
    radar_frame_rate: int = 20          # 帧率 (Hz)
    radar_range_bins: int = 256         # 距离门数量

    # 模拟器默认参数
    sim_hr_bpm: float = 72.0            # 模拟心率
    sim_rr_bpm: float = 16.0            # 模拟呼吸率
    sim_noise_level: float = 0.05       # 噪声水平

    # WebSocket
    ws_max_reconnect_attempts: int = 5

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = {"env_prefix": "SENSO_"}


settings = Settings()
