from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ArogyaCoachMessage, ChatResponse
from app.services.chat_service import chat_with_aromi

router = APIRouter(prefix="/aromi-chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
def chat(request: ArogyaCoachMessage, db: Session = Depends(get_db)):
    try:
        response_data = chat_with_aromi(request, db)
        return response_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")