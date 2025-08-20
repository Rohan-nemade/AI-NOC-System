from fastapi import FastAPI, Request, status
from app.routers import auth, subject, assignment, status, grievance, message, admin, marks, student
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )
app.include_router(student.router)
app.include_router(marks.router)
app.include_router(admin.router)
app.include_router(message.router)
app.include_router(grievance.router)
app.include_router(status.router)
app.include_router(assignment.router)
app.include_router(subject.router)
app.include_router(auth.router)


@app.get("/")
def home():
    return {"message": "Backend is running!"}
