from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


@router.get("/")
def health_check():
    return {
        "status": "healthy",
        "message": "AI Chatbot Pro API is running successfully"
    }