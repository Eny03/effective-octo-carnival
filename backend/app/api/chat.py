from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatQueryRequest, ChatQueryResponse
from app.ai.rag_engine import answer_rag_query

router = APIRouter(prefix="/api/chat", tags=["Chatbot RAG Neutrale"])

@router.post("", response_model=ChatQueryResponse)
async def chat_with_politilens(req: ChatQueryRequest, db: Session = Depends(get_db)):
    """
    RAG-powered conversational endpoint.
    Retrieves evidence from indexed proposals and generates an encyclopedic, strictly neutral comparative response with citations.
    """
    return await answer_rag_query(req, db)
