#!/bin/sh

python3 -m pytest --no && rm -rf test .pytest_cache

uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4

echo $?