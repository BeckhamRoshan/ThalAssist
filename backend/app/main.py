from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, chatbot
from app.utils.database import engine, Base
from app.models import user
from pydantic import BaseModel
from typing import Dict, List, Optional
import logging
from datetime import datetime

from .services.blood_service import BloodBankService
from .services.chatbot_service import AIChatbotService, BloodRequest, UrgencyLevel
from .services.donor_service import DonorService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ThalAssist+ API", 
    version="2.0.0",
    description="API for Thalassemia patient support with blood bank search and chatbot"
)


# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
#app.include_router(donors.router)
#app.include_router(blood.router)
app.include_router(chatbot.router)

# Initialize services
blood_service = BloodBankService()
ai_chatbot = AIChatbotService()
donor_service = DonorService()

# Pydantic models for API
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    location: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    type: str
    confidence: Optional[float] = None
    ai_category: Optional[str] = None
    related_topics: Optional[List[str]] = None
    severity: Optional[str] = None
    ai_actions: Optional[Dict] = None
    suggested_queries: Optional[List[str]] = None
    emergency_contacts: Optional[List[Dict]] = None

class BloodRequestModel(BaseModel):
    blood_type: str
    location: str
    urgency: str
    contact: str
    patient_age: Optional[int] = None
    units_needed: Optional[int] = None

class DonorEngagementRequest(BaseModel):
    donor_id: Optional[str] = None
    location: Optional[str] = None
    blood_type: Optional[str] = None

@app.get("/")
def read_root():
    return {
        "message": "Welcome to ThalAssist+ API",
        "endpoints": {
            "blood_availability": "/blood-availability",
            "chat": "/chat",
            "donor_match": "/donor-match",
            "health": "/health",
            "debug": "/debug/eraktkosh-connectivity"
        }
    }
# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ai_chatbot_status": "operational",
        "services": {
            "message_routing": "active",
            "blood_bridge": "active", 
            "emergency_system": "active",
            "donor_engagement": "active",
            "faq_handling": "active"
        }
    }

# Blood availability endpoints
@app.get("/blood-availability")
def blood_availability(
    state: str = Query(..., description="State name (e.g., Tamil Nadu)"),
    district: str = Query(..., description="District name (e.g., Chennai)"),
    blood_group: str = Query(..., description="Blood group (A+, B+, etc.)"),
    component: str = Query(default="Whole Blood", description="Blood component")
):
    """Get blood availability information"""
    return blood_service.get_blood_availability(state, district, blood_group, component)

@app.get("/debug/eraktkosh-connectivity")
def debug_eraktkosh_connectivity():
    """Test eRaktKosh connectivity and available endpoints"""
    return blood_service.test_connectivity()

# Chatbot endpoints
@app.get("/api/ai")
async def ai_root():
    return {
        "message": "ThalAssist+ AI Chatbot API",
        "version": "2.0.0",
        "ai_features": [
            "AI-Powered Message Routing",
            "Blood Bridge Coordination",
            "Emergency Blood Request System",
            "Predictive Donor Engagement",
            "Automated FAQ Handling"
        ]
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main AI chatbot endpoint with enhanced routing"""
    try:
        # Get AI-powered response
        response = ai_chatbot.get_response(request.message)
        
        # Convert to API response format
        chat_response = ChatResponse(
            response=response.get("response", ""),
            type=response.get("type", "general"),
            confidence=response.get("confidence"),
            ai_category=response.get("ai_category"),
            related_topics=response.get("related_topics", []),
            severity=response.get("severity"),
            ai_actions=response.get("ai_actions"),
            suggested_queries=response.get("suggested_queries", []),
            emergency_contacts=response.get("emergency_contacts")
        )
        
        return chat_response
        
    except Exception as e:
        logging.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error in chat processing")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-08-24T12:00:00Z"}

@app.post("/api/blood-bridge/coordinate")
async def blood_bridge_coordinate(request: BloodRequestModel):
    """AI-powered Blood Bridge Coordination endpoint"""
    try:
        # Convert request to internal format
        urgency_map = {
            "low": UrgencyLevel.LOW,
            "medium": UrgencyLevel.MEDIUM,
            "high": UrgencyLevel.HIGH,
            "critical": UrgencyLevel.CRITICAL,
            "emergency": UrgencyLevel.EMERGENCY
        }
        
        blood_request = BloodRequest(
            blood_type=request.blood_type,
            urgency=urgency_map.get(request.urgency.lower(), UrgencyLevel.MEDIUM),
            location=request.location,
            contact=request.contact,
            patient_age=request.patient_age,
            units_needed=request.units_needed
        )
        
        # Use AI coordination
        coordination_response = ai_chatbot.blood_bridge_coordination(
            f"Need {request.blood_type} blood in {request.location}", 
            blood_request
        )
        
        return coordination_response
        
    except Exception as e:
        logging.error(f"Blood bridge coordination error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error in blood bridge coordination")

@app.post("/api/emergency/blood-request")
async def emergency_blood_request(request: BloodRequestModel):
    """Emergency Blood Request System with immediate AI routing"""
    try:
        query = f"EMERGENCY: Need {request.blood_type} blood urgently in {request.location}"
        emergency_response = ai_chatbot.emergency_blood_request_system(query)
        
        return emergency_response
        
    except Exception as e:
        logging.error(f"Emergency blood request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error in emergency blood request processing")

@app.post("/api/donor/engagement")
async def predictive_donor_engagement(request: DonorEngagementRequest):
    """AI-powered Predictive Donor Engagement"""
    try:
        engagement_response = ai_chatbot.predictive_donor_engagement(request.donor_id)
        return engagement_response
        
    except Exception as e:
        logging.error(f"Donor engagement error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error in donor engagement processing")

@app.get("/api/ai/analytics")
async def get_ai_analytics():
    """Get AI system analytics and performance metrics"""
    try:
        analytics = ai_chatbot.get_ai_analytics()
        return analytics
        
    except Exception as e:
        logging.error(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving AI analytics")

@app.get("/api/conversation/history")
async def get_conversation_history():
    """Get conversation history with AI insights"""
    try:
        history = ai_chatbot.get_conversation_history()
        return {"conversation_history": history}
        
    except Exception as e:
        logging.error(f"History retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving conversation history")

@app.delete("/api/conversation/clear")
async def clear_conversation():
    """Clear conversation history"""
    try:
        result = ai_chatbot.clear_conversation()
        return result
        
    except Exception as e:
        logging.error(f"Clear conversation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error clearing conversation")

@app.get("/api/faq/topics")
async def get_faq_topics():
    """Get available FAQ topics with AI categorization"""
    try:
        topics = []
        for key, data in ai_chatbot.faq_database.items():
            topics.append({
                "topic": key.replace("_", " ").title(),
                "category": data.get("category", "general").value if hasattr(data.get("category"), 'value') else "general",
                "severity": data.get("severity", "general"),
                "has_ai_actions": data.get("action_available", False)
            })
        
        return {"faq_topics": topics}
        
    except Exception as e:
        logging.error(f"FAQ topics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving FAQ topics")



# Donor matching endpoints
@app.get("/donor-match")
def donor_match(
    blood_group: str = Query(..., description="Required blood group"),
    location: str = Query(..., description="Location (city/state)"),
    urgency: str = Query(default="normal", description="Urgency level: normal/urgent/emergency")
):
    """Find potential blood donors"""
    return donor_service.find_donors(blood_group, location, urgency)

@app.post("/donor-register")
def register_donor(donor_data: dict):
    """Register a new blood donor"""
    return donor_service.register_donor(donor_data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)