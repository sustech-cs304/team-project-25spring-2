# Backend Guide

This is the backend guide for the PeachIDE project.

## Development

### Prerequisites

0. Setup PostgreSQL database and set the environment variable

```bash
export POSTGRES_USER="YOUR_USERNAME"    # e.g. postgres is the default user
export POSTGRES_PASSWORD="YOUR_PASSWORD"
export POSTGRES_DB="YOUR_DATABASE_NAME" # e.g. postgres is the default database
```

1. Install `uv` the package manager

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create virtual environment

```bash
uv venv
source .venv/bin/activate
uv sync
```

3. Run the server

> [!WARNING]
> Make sure to run the backend on server with K8s and Docker.

```bash
fastapi dev app
# or
uvicorn app.main:app --reload
```

View OpenAPI document on `/docs`.

### Testing

Run testing with pytest

```
python3 -m pytest
```

To generate the test coverage report, run

```
pytest --cov=app test/
```

### Code Style

```
.
├── README.md
├── app
│   ├── __init__.py
│   ├── <routes>.py
│   ├── <routes>/
│   │   ├── __init__.py
│   │   └── *.py
│   └── main.py # Entry point
├── config
│   └── *.yaml # k8s config
├── pyproject.toml
└── uv.lock
```

Create a new route with single py or a directory.

## Deployment

See https://github.com/sustech-cs304/team-project-25spring-2/wiki/Deployment
