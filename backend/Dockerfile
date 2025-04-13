FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app
COPY uv.lock pyproject.toml .
COPY app/ ./app

RUN uv sync --frozen
ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]