from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.chatbot_service import AIChatbotService

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])
chatbot = AIChatbotService()

class ChatMessage(BaseModel):
    content: str

@router.post("/message")
async def chat_message(message: ChatMessage):
    response = chatbot.get_response(message.content)
    return {"response": response}
