from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatQueryRequest, ChatQueryResponse
from app.ai.rag_engine import answer_rag_query, stream_rag_query
from app.ai.llm_provider import llm_provider

router = APIRouter(prefix="/api/chat", tags=["Chatbot RAG Neutrale"])

@router.get("/provider")
async def get_active_provider():
    """Returns active AI provider details (Ollama, Groq, Gemini, or Institutional Offline)."""
    return await llm_provider.get_active_provider_info()

@router.post("", response_model=ChatQueryResponse)
async def chat_with_politilens(req: ChatQueryRequest, db: Session = Depends(get_db)):
    """
    Standard non-streaming RAG-powered conversational endpoint.
    Retrieves evidence from indexed proposals and generates an encyclopedic, strictly neutral comparative response with citations.
    """
    return await answer_rag_query(req, db)

@router.post("/stream")
async def chat_with_politilens_stream(req: ChatQueryRequest, db: Session = Depends(get_db)):
    """
    Real-time Token-by-Token Streaming SSE endpoint with Inspection Steps:
    - event: step (retrieval, fiscal check, neutrality balancing)
    - event: citations (sources and fact-check cards)
    - event: token (real-time stream of tokens)
    - event: done (completion signal)
    """
    return StreamingResponse(
        stream_rag_query(req, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
