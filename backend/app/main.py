from fastapi import FastAPI, Request, status, HTTPException
from app.routers import auth, noc, subject, assignment, status, grievance, message, admin, marks
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

app = FastAPI()


logger = logging.getLogger(__name__)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # Log HTTP exceptions if needed
    logger.warning(f"HTTP error {exc.status_code} at {request.url}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "path": str(request.url)}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log unexpected server errors
    logger.error(f"Unhandled error at {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )
app.include_router(marks.router)
app.include_router(admin.router)
app.include_router(message.router)
app.include_router(grievance.router)
app.include_router(status.router)
app.include_router(assignment.router)
app.include_router(subject.router)
app.include_router(auth.router)
app.include_router(noc.router)


@app.get("/")
def home():
    return {"message": "Backend is running!"}
