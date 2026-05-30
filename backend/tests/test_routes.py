import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_screen_missing_both_inputs():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/screen",
            data={"job_description": "Some JD"}
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_example():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/screen/example")
    assert response.status_code == 200
    data = response.json()
    assert "job_description" in data
    assert "resume_text" in data
