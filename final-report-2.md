# PeachIDE: Team Project - Sprint2

## Metrics

- Lines of Code:
- Number of source files:
- Cyclomatic complexity
- Number of dependencies

## Documentation

### Documentation for end users
#TODO
### Documentation for developers

## Tests

### 1. Technology/Tools/Frameworks/Approaches Used for Automatic Testing

#### **Core Testing Framework:**
- **pytest** - Python's modern testing framework for running and organizing tests
- **pytest-cov** - Coverage plugin for measuring test effectiveness
- **pytest-asyncio** - Support for testing asynchronous FastAPI endpoints

#### **API Testing Tools:**
- **FastAPI TestClient** - Dedicated test client for FastAPI applications
- **httpx** - Modern HTTP client used by TestClient

### **Testing Approaches:**
- **Integration Testing**: End-to-end testing that simulates real user workflows
- **Random Data Generation**: Using `uuid`, `random`, and `string` modules to ensure test isolation
- **Authentication Testing**: Comprehensive JWT token authentication flow testing
- **RESTful API Testing**: Testing all CRUD operations for the educational platform

### 2. Source Code or Related Artifact

- `test_auth.py` - Authentication and authorization testing
- `test_data_generation.py` - Comprehensive integration testing
- `test_config.py` - Test environment configuration

> URL Links: https://github.com/sustech-cs304/team-project-25spring-2/tree/backend/backend/test

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

## Deployment

https://github.com/sustech-cs304/team-project-25spring-2/wiki/Deployment
