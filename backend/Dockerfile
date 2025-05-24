FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app
COPY uv.lock pyproject.toml entrypoint.sh .
COPY app/ test/ .

RUN uv sync --frozen && chmod +x entrypoint.sh
ENV PATH="/app/.venv/bin:$PATH"

ENTRYPOINT ["./entrypoint.sh"]