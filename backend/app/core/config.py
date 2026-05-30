from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./resume_screener.db"
    MAX_FILE_SIZE_MB: int = 5

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
