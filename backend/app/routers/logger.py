from fastapi import APIRouter, Depends
from app.logger import get_logger
from app.dependencies import UserRole,require_role

router = APIRouter()  # Define the router instance

logger = get_logger()

@router.post("/example/", dependencies=[Depends(require_role(UserRole.admin))])
def example_route():
    logger.info("Example route called")
    return {"message": "Example route hit"}

