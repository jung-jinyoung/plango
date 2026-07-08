from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Plango API"
    environment: str = "development"
    # Quasar dev server 기본 포트. 배포 환경에서는 .env로 덮어쓴다.
    cors_origins: list[str] = ["http://localhost:9000", "http://localhost:8080"]


settings = Settings()
