from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

from .services.blood_service import BloodBankService
from .services.chatbot_service import ChatbotService
from .services.donor_service import DonorService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ThalAssist+ API", 
    version="1.0",
    description="API for Thalassemia patient support with blood bank search and chatbot"
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
blood_service = BloodBankService()
chatbot_service = ChatbotService()
donor_service = DonorService()

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

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "blood_availability": "active",
            "chatbot": "active",
            "donor_matching": "active",
            "eraktkosh_integration": "partial - fallback available"
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
@app.get("/chat")
def chat(query: str = Query(..., description="User's question")):
    """Enhanced chatbot for Thalassemia information"""
    return chatbot_service.get_response(query)

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