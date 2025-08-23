from fastapi import APIRouter, Depends
from app.dependencies import require_role, UserRole

router = APIRouter()

@router.post("/admin-only-route/", dependencies=[Depends(require_role(UserRole.admin))])
def admin_route(current_user = Depends(require_role("admin"))):
    return {"message": "Admin access successful"}
