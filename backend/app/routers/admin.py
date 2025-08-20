from fastapi import APIRouter, Depends
from app.dependencies import require_role

router = APIRouter()

@router.post("/admin-only-route/")
def admin_route(current_user = Depends(require_role("admin"))):
    return {"message": "Admin access successful"}
