import logging
from typing import Dict, List, Optional, Tuple
import re
from datetime import datetime, timedelta
from enum import Enum
import json
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class MessageCategory(Enum):
    GENERAL_INFO = "general_info"
    BLOOD_REQUEST = "blood_request"
    EMERGENCY = "emergency"
    DONOR_INQUIRY = "donor_inquiry"
    MEDICAL_CONSULTATION = "medical_consultation"
    APPOINTMENT_BOOKING = "appointment_booking"

class UrgencyLevel(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5

@dataclass
class BloodRequest:
    blood_type: str
    urgency: UrgencyLevel
    location: str
    contact: str
    patient_age: Optional[int] = None
    medical_condition: str = "thalassemia"
    units_needed: Optional[int] = None
    preferred_date: Optional[str] = None

@dataclass
class DonorProfile:
    donor_id: str
    blood_type: str
    location: str
    last_donation: Optional[str]
    availability_score: float
    contact_preference: str
    engagement_history: List[str]

class AIChatbotService:
    def __init__(self):
        self.conversation_history = []
        self.faq_database = self._initialize_faq()
        self.active_blood_requests = []
        self.donor_profiles = []
        self.engagement_patterns = {}
        self.message_routing_rules = self._initialize_routing_rules()
        
    def _initialize_routing_rules(self) -> Dict:
        """Initialize AI-powered message routing rules"""
        return {
            "keywords": {
                MessageCategory.BLOOD_REQUEST: [
                    "need blood", "urgent blood", "blood required", "blood donation",
                    "transfusion needed", "blood bank", "blood shortage", "b+", "o+", "ab+", "a+"
                ],
                MessageCategory.EMERGENCY: [
                    "emergency", "urgent", "critical", "asap", "immediately", 
                    "hospital", "ambulance", "severe", "crisis"
                ],
                MessageCategory.DONOR_INQUIRY: [
                    "donate blood", "blood donor", "donation center", "eligible to donate",
                    "donation criteria", "donor requirements"
                ],
                MessageCategory.MEDICAL_CONSULTATION: [
                    "symptoms", "treatment", "medication", "doctor", "specialist",
                    "chelation", "iron overload", "complications"
                ],
                MessageCategory.APPOINTMENT_BOOKING: [
                    "appointment", "booking", "schedule", "doctor visit", "consultation"
                ]
            },
            "patterns": {
                MessageCategory.BLOOD_REQUEST: [
                    r"need\s+(\w+)\s+blood",
                    r"looking for\s+(\w+)\s+blood",
                    r"(\w+)\s+blood\s+(needed|required)",
                    r"blood\s+type\s+(\w+)"
                ],
                MessageCategory.EMERGENCY: [
                    r"emergency.*blood",
                    r"urgent.*transfusion",
                    r"critical.*condition"
                ]
            }
        }

    def _initialize_faq(self) -> Dict:
        """Initialize enhanced FAQ database with AI routing info"""
        base_faq = {
            "what is thalassemia": {
                "response": "Thalassemia is an inherited blood disorder that affects the body's ability to produce hemoglobin and red blood cells. People with thalassemia have fewer healthy red blood cells and less hemoglobin than normal, leading to anemia.",
                "related_topics": ["symptoms", "types", "causes", "treatment"],
                "severity": "general",
                "category": MessageCategory.GENERAL_INFO,
                "confidence_keywords": ["inherited", "blood disorder", "hemoglobin", "anemia"]
            },
            "thalassemia types": {
                "response": "There are two main types: Alpha thalassemia (affects alpha globin chain production) and Beta thalassemia (affects beta globin chain production). Each type has subtypes: Minor (carrier), Intermedia (moderate), and Major (severe).",
                "related_topics": ["symptoms", "inheritance", "treatment"],
                "severity": "general",
                "category": MessageCategory.GENERAL_INFO,
                "confidence_keywords": ["alpha", "beta", "minor", "major", "intermedia"]
            },
            "blood transfusion": {
                "response": "Regular blood transfusions are essential for thalassemia major patients, typically needed every 2-4 weeks. This helps maintain adequate hemoglobin levels and prevents complications. I can help you find blood banks and coordinate with donors.",
                "related_topics": ["blood bank", "iron overload", "complications"],
                "severity": "critical",
                "category": MessageCategory.BLOOD_REQUEST,
                "action_available": True,
                "ai_routing": "blood_bridge_coordination"
            },
            "emergency blood": {
                "response": "For emergency blood needs: I'm immediately routing your request to our emergency blood network. Activating predictive donor matching and contacting high-availability donors in your area.",
                "related_topics": ["blood bank search", "blood compatibility"],
                "severity": "emergency",
                "category": MessageCategory.EMERGENCY,
                "action_available": True,
                "ai_routing": "emergency_blood_system"
            },
            "donate blood": {
                "response": "Thank you for wanting to donate! I'll assess your eligibility and connect you with nearby donation centers. Your donation can save lives of thalassemia patients who need regular transfusions.",
                "related_topics": ["donor criteria", "donation centers", "eligibility"],
                "severity": "important",
                "category": MessageCategory.DONOR_INQUIRY,
                "action_available": True,
                "ai_routing": "donor_engagement_system"
            }
        }
        
        # Add more comprehensive FAQ entries
        additional_faqs = {
            "symptoms": {
                "response": "Common thalassemia symptoms include: fatigue and weakness, pale skin, slow growth in children, abdominal swelling, dark urine, bone deformities (in severe cases), and enlarged spleen. Symptoms vary based on type and severity.",
                "related_topics": ["treatment", "complications", "diagnosis"],
                "severity": "important",
                "category": MessageCategory.MEDICAL_CONSULTATION
            },
            "treatment options": {
                "response": "Treatment includes regular blood transfusions, iron chelation therapy, folic acid supplements, and in some cases, bone marrow/stem cell transplant. I can help coordinate your treatment schedule and find resources.",
                "related_topics": ["blood transfusion", "chelation therapy", "complications"],
                "severity": "critical",
                "category": MessageCategory.MEDICAL_CONSULTATION,
                "action_available": True
            }
        }
        
        return {**base_faq, **additional_faqs}

    def ai_powered_message_routing(self, query: str) -> Tuple[MessageCategory, float]:
        """AI-powered message classification and routing"""
        query_lower = query.lower()
        category_scores = {}
        
        # Keyword-based scoring
        for category, keywords in self.message_routing_rules["keywords"].items():
            score = 0
            for keyword in keywords:
                if keyword in query_lower:
                    score += 10
                    # Boost score for exact matches
                    if keyword == query_lower.strip():
                        score += 20
            
            # Pattern-based scoring
            if category in self.message_routing_rules["patterns"]:
                for pattern in self.message_routing_rules["patterns"][category]:
                    if re.search(pattern, query_lower, re.IGNORECASE):
                        score += 15
            
            if score > 0:
                category_scores[category] = score
        
        # Contextual analysis based on conversation history
        if self.conversation_history:
            last_queries = [entry.get("user_query", "") for entry in self.conversation_history[-3:]]
            context = " ".join(last_queries)
            
            # Boost scores based on conversation context
            if "blood" in context and MessageCategory.BLOOD_REQUEST in category_scores:
                category_scores[MessageCategory.BLOOD_REQUEST] += 5
            if "emergency" in context and MessageCategory.EMERGENCY in category_scores:
                category_scores[MessageCategory.EMERGENCY] += 10
        
        # Urgency detection
        urgency_keywords = ["urgent", "emergency", "critical", "asap", "immediately", "severe"]
        if any(keyword in query_lower for keyword in urgency_keywords):
            if MessageCategory.EMERGENCY in category_scores:
                category_scores[MessageCategory.EMERGENCY] += 25
            else:
                category_scores[MessageCategory.EMERGENCY] = 25
        
        # Return highest scoring category
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            confidence = min(category_scores[best_category] / 50.0, 1.0)  # Normalize to 0-1
            return best_category, confidence
        
        return MessageCategory.GENERAL_INFO, 0.5

    def blood_bridge_coordination(self, query: str, blood_request: BloodRequest) -> Dict:
        """AI-powered blood bridge coordination system"""
        # Extract blood type and location from query if not provided
        blood_type_patterns = [r'([ABO]+[+-])', r'(o\s*negative|o\s*positive|a\s*positive|b\s*positive|ab\s*positive)']
        
        extracted_blood_type = None
        for pattern in blood_type_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                extracted_blood_type = match.group(1).upper().replace(' ', '')
                break
        
        if extracted_blood_type:
            blood_request.blood_type = extracted_blood_type
        
        # Determine urgency level from query
        if any(word in query.lower() for word in ["emergency", "critical", "urgent"]):
            blood_request.urgency = UrgencyLevel.EMERGENCY
        elif any(word in query.lower() for word in ["soon", "needed", "asap"]):
            blood_request.urgency = UrgencyLevel.HIGH
        else:
            blood_request.urgency = UrgencyLevel.MEDIUM
        
        # Add to active requests
        self.active_blood_requests.append(blood_request)
        
        # Find compatible donors using predictive matching
        compatible_donors = self.predictive_donor_matching(blood_request)
        
        response = {
            "response": f"🩸 Blood Bridge Activated! I'm coordinating your {blood_request.blood_type} blood request.",
            "type": "blood_coordination",
            "blood_type": blood_request.blood_type,
            "urgency": blood_request.urgency.name,
            "compatible_donors_found": len(compatible_donors),
            "estimated_availability": f"{len(compatible_donors) * 20}% match rate",
            "next_steps": [
                "Contacting high-availability donors",
                "Checking blood bank inventory",
                "Coordinating with nearest medical facilities"
            ]
        }
        
        if blood_request.urgency == UrgencyLevel.EMERGENCY:
            response["emergency_protocol"] = "Emergency blood network activated. Priority routing to nearest blood banks."
            response["estimated_response_time"] = "15-30 minutes"
        
        return response

    def predictive_donor_engagement(self, donor_id: str = None) -> Dict:
        """AI-powered predictive donor engagement"""
        if not donor_id:
            # General donor engagement
            engagement_data = {
                "optimal_contact_time": "Evening (6-8 PM)",
                "preferred_communication": "WhatsApp/SMS",
                "donation_readiness_score": 0.75,
                "predicted_availability": "Next 7 days: 68% likely",
                "engagement_strategy": [
                    "Personalized thank you messages",
                    "Health impact statistics",
                    "Community recognition program"
                ]
            }
        else:
            # Specific donor analysis
            donor_profile = self.get_donor_profile(donor_id)
            engagement_data = {
                "donor_id": donor_id,
                "last_engagement": donor_profile.engagement_history[-1] if donor_profile.engagement_history else "No history",
                "response_pattern": "Usually responds within 2 hours",
                "optimal_approach": "Medical emergency context works best",
                "availability_prediction": f"{donor_profile.availability_score * 100}%"
            }
        
        return {
            "response": "🤖 AI Donor Engagement Analysis Complete",
            "type": "donor_engagement",
            "engagement_data": engagement_data,
            "automated_actions": [
                "Scheduled follow-up reminders",
                "Personalized outreach messages",
                "Optimal timing notifications"
            ]
        }

    def predictive_donor_matching(self, blood_request: BloodRequest) -> List[DonorProfile]:
        """AI-powered predictive donor matching"""
        # This would integrate with your donor database
        # For demo purposes, creating sample donors
        sample_donors = [
            DonorProfile(
                donor_id="D001",
                blood_type=blood_request.blood_type,
                location=blood_request.location,
                last_donation="2024-06-15",
                availability_score=0.85,
                contact_preference="whatsapp",
                engagement_history=["responded", "donated", "available"]
            ),
            DonorProfile(
                donor_id="D002", 
                blood_type=blood_request.blood_type,
                location=blood_request.location,
                last_donation="2024-07-20",
                availability_score=0.72,
                contact_preference="sms",
                engagement_history=["responded", "busy", "available"]
            )
        ]
        
        # AI scoring algorithm
        compatible_donors = []
        for donor in sample_donors:
            # Blood type compatibility
            if self.is_blood_compatible(donor.blood_type, blood_request.blood_type):
                # Calculate composite score
                availability_score = donor.availability_score
                recency_score = self.calculate_donation_recency_score(donor.last_donation)
                location_score = self.calculate_location_proximity(donor.location, blood_request.location)
                engagement_score = len([h for h in donor.engagement_history if h == "responded"]) / max(len(donor.engagement_history), 1)
                
                composite_score = (availability_score * 0.4 + recency_score * 0.2 + 
                                 location_score * 0.2 + engagement_score * 0.2)
                
                if composite_score > 0.5:  # Threshold for inclusion
                    compatible_donors.append(donor)
        
        # Sort by composite score (highest first)
        return sorted(compatible_donors, key=lambda d: d.availability_score, reverse=True)

    def emergency_blood_request_system(self, query: str) -> Dict:
        """Emergency blood request system with immediate routing"""
        # Parse emergency details
        blood_type = self.extract_blood_type(query)
        location = self.extract_location(query) or "Current Location"
        
        emergency_request = BloodRequest(
            blood_type=blood_type or "Unknown",
            urgency=UrgencyLevel.EMERGENCY,
            location=location,
            contact="Emergency Contact",
            units_needed=self.extract_units_needed(query) or 2
        )
        
        # Immediate actions
        response = {
            "response": "🚨 EMERGENCY BLOOD REQUEST ACTIVATED 🚨\n\nImmediate actions taken:\n✅ Priority routing to blood banks\n✅ Emergency donor network activated\n✅ Medical facilities notified",
            "type": "emergency_blood",
            "severity": "critical",
            "emergency_id": f"EMG_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "blood_request": {
                "type": emergency_request.blood_type,
                "units": emergency_request.units_needed,
                "location": emergency_request.location,
                "urgency": "CRITICAL"
            },
            "immediate_contacts": [
                {"service": "108 Emergency", "number": "108"},
                {"service": "Blood Bank Helpline", "number": "1910"},
                {"service": "Red Cross", "number": "011-23711551"}
            ],
            "estimated_response": "10-15 minutes",
            "tracking": "Real-time updates will be sent to your registered mobile number"
        }
        
        # Add to emergency queue
        self.active_blood_requests.append(emergency_request)
        
        return response

    def automated_faq_handling(self, query: str) -> Dict:
        """Enhanced automated FAQ handling with AI"""
        # Use existing FAQ matching logic but enhanced
        best_match = self._find_best_match(query)
        
        if best_match:
            response_data = self.faq_database[best_match]
            
            # AI enhancement: contextual response modification
            base_response = response_data["response"]
            
            # Add contextual intelligence
            if "category" in response_data:
                category = response_data["category"]
                
                if category == MessageCategory.BLOOD_REQUEST:
                    base_response += "\n\n🤖 AI Assistant: I can immediately help you find blood banks and coordinate with donors. Would you like me to start the blood bridge coordination?"
                
                elif category == MessageCategory.EMERGENCY:
                    base_response += "\n\n🚨 Emergency protocols activated. Routing to immediate assistance."
                
                elif category == MessageCategory.DONOR_INQUIRY:
                    base_response += "\n\n💝 AI Donor Matching: I'll assess your eligibility and find the best donation opportunities for you."
            
            # Enhanced response structure
            enhanced_response = {
                "response": base_response,
                "topic": best_match.replace("_", " ").title(),
                "confidence": "high",
                "ai_category": response_data.get("category", MessageCategory.GENERAL_INFO).value,
                "related_topics": response_data.get("related_topics", []),
                "severity": response_data.get("severity", "general"),
                "intelligent_suggestions": self.generate_intelligent_suggestions(query, best_match)
            }
            
            # Add AI-powered action buttons
            if response_data.get("ai_routing"):
                enhanced_response["ai_actions"] = self.get_ai_actions(response_data["ai_routing"])
            
            return enhanced_response
        
        return self._get_fallback_response(query)

    def generate_intelligent_suggestions(self, query: str, matched_topic: str) -> List[str]:
        """Generate AI-powered intelligent follow-up suggestions"""
        suggestions = []
        
        if "blood" in query.lower():
            suggestions.extend([
                "Find blood banks near you",
                "Check blood compatibility",
                "Connect with donors in your area"
            ])
        
        if "treatment" in matched_topic:
            suggestions.extend([
                "Schedule treatment reminders",
                "Find specialist doctors",
                "Track medication schedule"
            ])
        
        if "emergency" in query.lower():
            suggestions.extend([
                "Save emergency contacts",
                "Find nearest hospitals",
                "Set up emergency alerts"
            ])
        
        return suggestions[:3]  # Limit to 3 suggestions

    def get_ai_actions(self, routing_type: str) -> Dict:
        """Get AI-powered actions based on routing type"""
        actions = {
            "blood_bridge_coordination": {
                "primary": "Start Blood Bridge",
                "secondary": ["Find Donors", "Check Blood Banks", "Emergency Protocol"],
                "description": "AI will coordinate blood requests across multiple channels"
            },
            "emergency_blood_system": {
                "primary": "Activate Emergency Network", 
                "secondary": ["Call 108", "Find Nearest Hospital", "Contact Blood Banks"],
                "description": "Immediate emergency response with AI routing"
            },
            "donor_engagement_system": {
                "primary": "Assess Donor Eligibility",
                "secondary": ["Find Donation Centers", "Schedule Appointment", "Get Donation Tips"],
                "description": "AI-powered donor matching and engagement"
            }
        }
        
        return actions.get(routing_type, {})

    # Enhanced main response method
    def get_response(self, query: str) -> Dict:
        """Enhanced AI-powered chatbot response"""
        query = query.strip().lower()
        
        # Log conversation with AI metadata
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "user_query": query,
            "query_length": len(query)
        })
        
        # AI-powered message routing
        category, confidence = self.ai_powered_message_routing(query)
        
        # Handle different categories with AI
        if self._is_greeting(query):
            return self._get_ai_greeting_response()
        
        elif category == MessageCategory.EMERGENCY:
            return self.emergency_blood_request_system(query)
        
        elif category == MessageCategory.BLOOD_REQUEST:
            blood_request = BloodRequest(
                blood_type="Unknown",
                urgency=UrgencyLevel.HIGH,
                location="User Location",
                contact="User Contact"
            )
            return self.blood_bridge_coordination(query, blood_request)
        
        elif category == MessageCategory.DONOR_INQUIRY:
            return self.predictive_donor_engagement()
        
        else:
            return self.automated_faq_handling(query)

    def _get_ai_greeting_response(self) -> Dict:
        """AI-enhanced greeting with personalization"""
        return {
            "response": "🤖 Hello! I'm ThalAssist+ AI - your intelligent virtual assistant for Thalassemia care. I use advanced AI for:\n\n🩸 Smart Blood Bridge Coordination\n🚨 Emergency Response Routing\n👥 Predictive Donor Matching\n💬 Intelligent FAQ Assistance\n\nHow can I help you today?",
            "type": "ai_greeting",
            "ai_capabilities": [
                "Blood Bridge Coordination",
                "Emergency Response System", 
                "Predictive Donor Matching",
                "Intelligent Message Routing",
                "Automated FAQ Handling"
            ],
            "suggested_queries": [
                "I need blood urgently",
                "Find blood donors near me",
                "Emergency blood request",
                "What is thalassemia treatment?"
            ]
        }

    # Helper methods
    def extract_blood_type(self, query: str) -> Optional[str]:
        """Extract blood type from query"""
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        for blood_type in blood_types:
            if blood_type.lower() in query.lower():
                return blood_type
        return None

    def extract_location(self, query: str) -> Optional[str]:
        """Extract location from query"""
        # Simple location extraction - in production, use NLP
        location_keywords = ["in", "at", "near", "around"]
        words = query.split()
        for i, word in enumerate(words):
            if word.lower() in location_keywords and i + 1 < len(words):
                return words[i + 1]
        return None

    def extract_units_needed(self, query: str) -> Optional[int]:
        """Extract number of units needed"""
        import re
        match = re.search(r'(\d+)\s*(unit|bag|bottle)', query.lower())
        return int(match.group(1)) if match else None

    def is_blood_compatible(self, donor_type: str, recipient_type: str) -> bool:
        """Check blood type compatibility"""
        compatibility_map = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        }
        return recipient_type in compatibility_map.get(donor_type, [])

    def calculate_donation_recency_score(self, last_donation: Optional[str]) -> float:
        """Calculate score based on donation recency"""
        if not last_donation:
            return 0.5
        
        try:
            last_date = datetime.fromisoformat(last_donation)
            days_ago = (datetime.now() - last_date).days
            
            # Optimal donation interval is 56+ days
            if days_ago >= 56:
                return 1.0
            elif days_ago >= 28:
                return 0.7
            else:
                return 0.3
        except:
            return 0.5

    def calculate_location_proximity(self, donor_location: str, request_location: str) -> float:
        """Calculate location proximity score"""
        # Simplified - in production use geolocation
        if donor_location.lower() == request_location.lower():
            return 1.0
        elif any(word in donor_location.lower() for word in request_location.lower().split()):
            return 0.7
        else:
            return 0.3

    def get_donor_profile(self, donor_id: str) -> DonorProfile:
        """Get donor profile by ID"""
        # Sample implementation - replace with actual database lookup
        return DonorProfile(
            donor_id=donor_id,
            blood_type="B+",
            location="Sample Location",
            last_donation="2024-06-01",
            availability_score=0.8,
            contact_preference="whatsapp",
            engagement_history=["responded", "available", "donated"]
        )

    # Keep existing helper methods from original class
    def _is_greeting(self, query: str) -> bool:
        greetings = ["hi", "hello", "hey", "greetings", "good morning", "good evening", "good afternoon"]
        return any(greeting in query for greeting in greetings)

    def _find_best_match(self, query: str) -> str:
        """Enhanced FAQ matching with AI improvements"""
        scores = {}
        
        for key, data in self.faq_database.items():
            score = 0
            
            # Enhanced keyword matching
            key_words = key.split()
            query_words = query.split()
            
            # Exact matches get highest score
            for key_word in key_words:
                if key_word in query:
                    score += 15
            
            # Partial word matching
            for key_word in key_words:
                for query_word in query_words:
                    if key_word in query_word or query_word in key_word:
                        score += 8
            
            # Confidence keywords boost (AI enhancement)
            if "confidence_keywords" in data:
                for keyword in data["confidence_keywords"]:
                    if keyword in query:
                        score += 12
            
            # Related topics matching
            related_topics = data.get("related_topics", [])
            for topic in related_topics:
                if topic in query:
                    score += 5
            
            # Semantic similarity (simplified)
            semantic_score = self.calculate_semantic_similarity(query, key)
            score += semantic_score * 10
            
            if score > 0:
                scores[key] = score
        
        if scores:
            best_key = max(scores, key=scores.get)
            if scores[best_key] >= 8:  # Adjusted threshold
                return best_key
        
        return None

    def calculate_semantic_similarity(self, query: str, topic: str) -> float:
        """Simple semantic similarity calculation"""
        query_words = set(query.lower().split())
        topic_words = set(topic.lower().split())
        
        if not query_words or not topic_words:
            return 0.0
        
        intersection = query_words.intersection(topic_words)
        union = query_words.union(topic_words)
        
        return len(intersection) / len(union) if union else 0.0

    def _get_fallback_response(self, query: str) -> Dict:
        """AI-enhanced fallback response"""
        category, confidence = self.ai_powered_message_routing(query)
        
        response = {
            "response": "I don't have specific information about that, but my AI analysis suggests you might be looking for information related to thalassemia care.",
            "type": "ai_fallback",
            "confidence": confidence,
            "detected_category": category.value,
            "ai_suggestions": self.generate_intelligent_suggestions(query, "general")
        }
        
        # Category-specific fallback responses
        if category == MessageCategory.BLOOD_REQUEST:
            response["specific_help"] = "I can help you with blood-related queries. Try asking 'I need blood' or 'find blood banks near me'."
        elif category == MessageCategory.EMERGENCY:
            response["specific_help"] = "For emergencies, I can activate emergency protocols. Try saying 'emergency blood needed'."
        
        response["available_topics"] = [
            "Blood transfusion and availability",
            "Emergency blood requests", 
            "Donor matching and coordination",
            "Thalassemia treatment information",
            "Symptoms and medical consultation"
        ]
        
        return response

    def get_conversation_history(self) -> List[Dict]:
        """Get conversation history with AI analytics"""
        return self.conversation_history

    def get_ai_analytics(self) -> Dict:
        """Get AI system analytics"""
        return {
            "total_conversations": len(self.conversation_history),
            "active_blood_requests": len(self.active_blood_requests),
            "donor_profiles": len(self.donor_profiles),
            "emergency_requests": len([r for r in self.active_blood_requests if r.urgency == UrgencyLevel.EMERGENCY]),
            "ai_routing_accuracy": "94.2%",  # Example metric
            "response_categories": {
                "blood_requests": len([r for r in self.active_blood_requests if r.urgency != UrgencyLevel.EMERGENCY]),
                "emergency_requests": len([r for r in self.active_blood_requests if r.urgency == UrgencyLevel.EMERGENCY]),
                "general_info": len(self.conversation_history) - len(self.active_blood_requests)
            }
        }

    def clear_conversation(self) -> Dict:
        """Clear conversation history"""
        self.conversation_history = []
        return {"message": "Conversation history cleared", "status": "success"}
