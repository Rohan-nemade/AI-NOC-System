from fastapi import APIRouter
from app.logger import get_logger

router = APIRouter()  # Define the router instance

logger = get_logger()

@router.post("/example/")
def example_route():
    logger.info("Example route called")
    return {"message": "Example route hit"}

