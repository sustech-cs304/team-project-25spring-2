from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth.utils import (
    decode_access_token,
    get_user_by_id,
    validate_session,
    get_session_by_id,
)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(credentials.credentials)
    session_id: str = payload.get("sub")

    # Validate session
    if not validate_session(db, session_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    session = get_session_by_id(db, session_id)
    user = get_user_by_id(db, session.user_id)

    return user
