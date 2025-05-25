FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app
COPY uv.lock pyproject.toml ./
COPY entrypoint.sh ./

ADD app /app/app
ADD test /app/test

RUN uv sync --frozen && chmod +x entrypoint.sh
ENV PATH="/app/.venv/bin:$PATH"

ENTRYPOINT ["./entrypoint.sh"]