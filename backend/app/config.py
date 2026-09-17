from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    lm_studio_base_url: str = "http://10.0.0.222:1234/v1"
    lm_studio_api_key: str = "lm-studio"
    lm_studio_model: str = "qwen2.5-coder-14b-instruct"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_prefix = "RICE_"
        env_file = ".env"


settings = Settings()
