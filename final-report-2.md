# PeachIDE: Team Project - Sprint2

## Metrics

- Lines of Code:
- Number of source files:
- Cyclomatic complexity:
- Number of dependencies:

## Documentation

### Documentation for end users

See https://github.com/sustech-cs304/team-project-25spring-2/wiki/User-Guide

### Documentation for developers

API Documentation: https://peach.benx.dev/docs

## Tests

### Core Testing Framework

- **pytest** Python's modern testing framework for running and organizing tests
    - **pytest-cov** Coverage plugin for measuring test effectiveness
    - **pytest-asyncio** Support for testing asynchronous FastAPI endpoints

### Testing Approaches

- **Integration Testing**: End-to-end testing that simulates real user workflows
- **Random Data Generation**: Using `uuid`, `random`, and `string` modules to ensure test isolation
- **Authentication Testing**: Comprehensive JWT token authentication flow testing
- **RESTful API Testing**: Testing all CRUD operations for the educational platform

### 2. Source Code or Related Artifact

- `test_config.py` Test environment configuration
- `test_auth.py` Authentication and authorization testing
- `test_data_generation.py` Comprehensive integration testing

> Test Repository: https://github.com/sustech-cs304/team-project-25spring-2/blob/main/backend/test

### 3. Test Coverage report

```
test/test_auth.py ....                                                                                                                                            [ 33%]
test/test_data_generation.py ........                                                                                                                             [100%]

============================================================================ tests coverage =============================================================================
___________________________________________________________ coverage: platform darwin, python 3.13.3-final-0 ____________________________________________________________

Name                         Stmts   Miss  Cover
------------------------------------------------
app/__init__.py                  2      0   100%
app/ai/__init__.py             101     72    29%
app/auth/__init__.py            49      4    92%
app/auth/middleware.py          14      0   100%
app/auth/utils.py               32      0   100%
app/coding/__init__.py         213    163    23%
app/coding/api.py               21     16    24%
app/db.py                       16      0   100%
app/main.py                     45      5    89%
app/models/assignment.py        14      0   100%
app/models/bookmarklist.py      10      0   100%
app/models/chat.py              10      0   100%
app/models/code_snippet.py      14      0   100%
app/models/comment.py           11      0   100%
app/models/course.py            16      0   100%
app/models/environment.py       18      0   100%
app/models/file.py              17      0   100%
app/models/group.py              8      0   100%
app/models/material.py          10      0   100%
app/models/note.py               9      0   100%
app/models/section.py           10      0   100%
app/models/user.py              48      0   100%
app/slides/__init__.py           0      0   100%
app/slides/assignment.py        38     17    55%
app/slides/bookmarklist.py      56     23    59%
app/slides/code_snippet.py      68     30    56%
app/slides/comment.py           40     24    40%
app/slides/course.py           104     41    61%
app/slides/environment.py        0      0   100%
app/slides/file.py              43     30    30%
app/slides/group.py             42     20    52%
app/slides/material.py          75     42    44%
app/slides/note.py              42     17    60%
app/slides/section.py           56     21    62%
app/slides/user.py              31      2    94%
------------------------------------------------
TOTAL                         1283    527    59%
========================================================================== 12 passed in 5.51s ===========================================================================
```

## Build

We use Dockerfile as our build scripts.

Frontend uses Next.js for building the frontend application, which compiles to
static html/css/js files as a standalone web application.

Backend is empowered by FastAPI. As it is a Python application, it does not require compilation. The dependencies are managed by `uv`. `uv` uses a venv environment for development and deployment.

Inside backend system, user's coding environment is containerized in pods of Kubernetes. Every pod has a tiny websocket server powered by node.js, which also runs as it is.

### Tasks

We use GitHub Actions for automated build. In the CI/CD pipeline, it
1. Setup environment
2. Resolve dependencies and build the project (involves compiler linting)
3. Build Docker images
4. Push Docker images to GitHub Container Registry

In development, we do the following manually:
1. Format code (`ruff` for Python, `ES6 Linter` for Typescript)
2. Run tests (`pytest` for Python)

### Final Artifacts

Our artifacts are the source code of the project, and Docker images stored in GitHub Container Registry (ghcr.io).
- **Actions** - https://github.com/sustech-cs304/team-project-25spring-2/actions

### Build Artifacts

- CI/CD workflow: https://github.com/sustech-cs304/team-project-25spring-2/tree/backend/.github/workflows
- Frontend: https://github.com/sustech-cs304/team-project-25spring-2/blob/main/peachide/Dockerfile
- Backend: https://github.com/sustech-cs304/team-project-25spring-2/blob/main/backend/Dockerfile
- User Environment: https://github.com/sustech-cs304/team-project-25spring-2/blob/main/backend/websocket/Dockerfile

### 4. BuildFile

1. Backend README: 
- **Documentation** https://github.com/sustech-cs304/team-project-25spring-2/blob/main/backend/README.md
- **Package management** https://github.com/sustech-cs304/team-project-25spring-2/blob/main/backend/pyproject.toml
2. Frontend README: 
- **Documentation** https://github.com/sustech-cs304/team-project-25spring-2/blob/main/peachide/README.md
- **Package management** https://github.com/sustech-cs304/team-project-25spring-2/blob/main/peachide/package.json

## Deployment

PeachIDE is deployed on a cloud server with Kubernetes (K3S) and Docker
- K8S Deployments: frontend, backend, and database
- Traefik ingress: gateway for routing to all services. [ Dashboard ](https://traefik.peach.benx.dev/)
- Docker: hosting code execution engine, which needs to be separated from K8S.

To automatically deploy our project, we use GitHub Actions to deploy to our server. The deployment can be publicly accessed via https://peach.benx.dev.

See https://github.com/sustech-cs304/team-project-25spring-2/wiki/Deployment for deployment instructions.
