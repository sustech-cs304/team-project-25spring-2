# Backend Guide

This is the backend guide for the PeachIDE project.

## Development

### Prerequisites

1. Install `uv` the package manager

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create virtual environment

```bash
uv venv
source .venv/bin/activate
```

3. Run the server

> [!WARNING]
> Make sure to run the backend on server with K8s and Docker.

```bash
uvicorn app.main:app --reload
```

View OpenAPI document on `/docs`.

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
├── pyproject.toml
└── uv.lock
```

Create a new route with single py or a directory.

## Deployment

TBD