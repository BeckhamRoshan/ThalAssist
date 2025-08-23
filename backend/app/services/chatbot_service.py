import logging
from typing import Dict, List
import re
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self):
        self.conversation_history = []
        self.faq_database = self._initialize_faq()
    
    def _initialize_faq(self) -> Dict:
        """Initialize the FAQ database for Thalassemia"""
        return {
            "what is thalassemia": {
                "response": "Thalassemia is an inherited blood disorder that affects the body's ability to produce hemoglobin and red blood cells. People with thalassemia have fewer healthy red blood cells and less hemoglobin than normal, leading to anemia.",
                "related_topics": ["symptoms", "types", "causes", "treatment"],
                "severity": "general"
            },
            "thalassemia types": {
                "response": "There are two main types: Alpha thalassemia (affects alpha globin chain production) and Beta thalassemia (affects beta globin chain production). Each type has subtypes: Minor (carrier), Intermedia (moderate), and Major (severe).",
                "related_topics": ["symptoms", "inheritance", "treatment"],
                "severity": "general"
            },
            "thalassemia symptoms": {
                "response": "Common symptoms include: fatigue and weakness, pale skin, slow growth in children, abdominal swelling, dark urine, bone deformities (in severe cases), and enlarged spleen. Symptoms vary based on the type and severity.",
                "related_topics": ["treatment", "complications", "diagnosis"],
                "severity": "important"
            },
            "thalassemia treatment": {
                "response": "Treatment includes regular blood transfusions, iron chelation therapy to remove excess iron, folic acid supplements, and in some cases, bone marrow/stem cell transplant. Treatment varies based on severity.",
                "related_topics": ["blood transfusion", "chelation therapy", "complications"],
                "severity": "critical"
            },
            "blood transfusion": {
                "response": "Regular blood transfusions are essential for thalassemia major patients, typically needed every 2-4 weeks. This helps maintain adequate hemoglobin levels and prevents complications. You can find blood banks using our blood availability search.",
                "related_topics": ["blood bank", "iron overload", "complications"],
                "severity": "critical",
                "action_available": True
            },
            "chelation therapy": {
                "response": "Iron chelation therapy removes excess iron from the body caused by repeated blood transfusions. Common chelators include Deferasirox (oral), Deferoxamine (injection), and Deferiprone (oral). Regular monitoring is essential.",
                "related_topics": ["side effects", "monitoring", "treatment"],
                "severity": "critical"
            },
            "thalassemia inheritance": {
                "response": "Thalassemia is inherited when both parents carry the gene. If both parents are carriers: 25% chance of normal child, 50% chance of carrier child, 25% chance of affected child. Genetic counseling is recommended.",
                "related_topics": ["prevention", "genetic counseling", "screening"],
                "severity": "important"
            },
            "thalassemia prevention": {
                "response": "Prevention involves genetic counseling and prenatal screening. Carrier testing before marriage/pregnancy helps identify risks. Prenatal diagnosis can detect thalassemia in the fetus. Community awareness is crucial.",
                "related_topics": ["genetic counseling", "screening", "inheritance"],
                "severity": "important"
            },
            "diet for thalassemia": {
                "response": "Recommended diet: high in vitamins (especially B vitamins and vitamin C), calcium-rich foods, adequate protein. Avoid: iron supplements (unless prescribed), excessive vitamin C, tea/coffee with meals. Maintain healthy weight.",
                "related_topics": ["supplements", "nutrition", "treatment"],
                "severity": "important"
            },
            "thalassemia complications": {
                "response": "Possible complications include iron overload (heart, liver damage), enlarged spleen, bone problems, growth delays, heart complications, diabetes, and infections. Regular monitoring and proper treatment help prevent these.",
                "related_topics": ["monitoring", "treatment", "iron overload"],
                "severity": "critical"
            },
            "blood bank search": {
                "response": "You can search for blood banks and check blood availability in your area. Our system searches multiple sources including eRaktKosh portal and provides contact details of nearby blood banks.",
                "related_topics": ["blood transfusion", "emergency"],
                "severity": "critical",
                "action_available": True
            },
            "emergency blood": {
                "response": "For emergency blood needs: Contact multiple blood banks immediately, visit nearest major hospital, call emergency helplines, consider alternative blood groups in emergency (with medical approval). Our blood search can help find nearby banks quickly.",
                "related_topics": ["blood bank search", "blood compatibility"],
                "severity": "emergency",
                "action_available": True
            },
            "blood compatibility": {
                "response": "Blood compatibility for thalassemia patients follows standard rules: same blood group is preferred, but in emergencies, compatible types may be used (O- is universal donor, AB+ is universal recipient). Always consult with medical team.",
                "related_topics": ["blood transfusion", "emergency blood"],
                "severity": "critical"
            },
            "thalassemia monitoring": {
                "response": "Regular monitoring includes: Complete Blood Count (monthly), iron levels (every 3 months), heart function tests, liver function tests, bone density scans, and growth monitoring in children. Follow your doctor's schedule.",
                "related_topics": ["complications", "treatment"],
                "severity": "critical"
            },
            "living with thalassemia": {
                "response": "Living well with thalassemia: Follow treatment regimen strictly, maintain regular medical checkups, eat a balanced diet, stay active as tolerated, avoid infections, join support groups, and plan ahead for blood transfusions.",
                "related_topics": ["treatment", "diet", "monitoring"],
                "severity": "important"
            }
        }
    
    def get_response(self, query: str) -> Dict:
        """Get chatbot response for user query"""
        query = query.strip().lower()
        
        # Log the conversation
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "user_query": query,
            "query_length": len(query)
        })
        
        # Handle greeting
        if self._is_greeting(query):
            return self._get_greeting_response()
        
        # Handle emergency keywords
        if self._is_emergency_query(query):
            return self._get_emergency_response(query)
        
        # Search for best matching FAQ
        best_match = self._find_best_match(query)
        
        if best_match:
            response_data = self.faq_database[best_match]
            response = self._build_response(best_match, response_data, query)
            
            # Add conversation context
            response["conversation_id"] = len(self.conversation_history)
            
            return response
        
        # No match found - provide helpful fallback
        return self._get_fallback_response(query)
    
    def _is_greeting(self, query: str) -> bool:
        """Check if query is a greeting"""
        greetings = ["hi", "hello", "hey", "greetings", "good morning", "good evening", "good afternoon"]
        return any(greeting in query for greeting in greetings)
    
    def _get_greeting_response(self) -> Dict:
        """Return greeting response"""
        return {
            "response": "Hello! I'm ThalAssist+, your virtual assistant for Thalassemia information. I can help you with treatment info, blood bank searches, dietary advice, and more. How can I assist you today?",
            "type": "greeting",
            "suggested_queries": [
                "What is thalassemia?",
                "Find blood banks near me",
                "Thalassemia treatment options",
                "Diet for thalassemia patients"
            ]
        }
    
    def _is_emergency_query(self, query: str) -> bool:
        """Check if query indicates emergency"""
        emergency_keywords = ["emergency", "urgent", "immediate", "asap", "critical", "severe", "hospital", "ambulance"]
        return any(keyword in query for keyword in emergency_keywords)
    
    def _get_emergency_response(self, query: str) -> Dict:
        """Return emergency response"""
        return {
            "response": "⚠️ EMERGENCY DETECTED ⚠️\n\nFor immediate medical emergencies, please:\n1. Call 108 (Ambulance) immediately\n2. Visit the nearest hospital\n3. Contact your hematologist\n\nFor urgent blood needs, I can help you find blood banks quickly.",
            "type": "emergency",
            "severity": "critical",
            "emergency_contacts": {
                "National Emergency": "108",
                "Blood Bank Helpline": "1910",
                "National Blood Transfusion Council": "011-23061462"
            },
            "action_available": "Use blood bank search for urgent blood needs",
            "disclaimer": "This is not a substitute for emergency medical care."
        }
    
    def _find_best_match(self, query: str) -> str:
        """Find the best matching FAQ using multiple techniques"""
        scores = {}
        
        for key, data in self.faq_database.items():
            score = 0
            
            # Exact keyword matching
            key_words = key.split()
            query_words = query.split()
            
            for key_word in key_words:
                if key_word in query:
                    score += 10
            
            # Partial word matching
            for key_word in key_words:
                for query_word in query_words:
                    if key_word in query_word or query_word in key_word:
                        score += 5
            
            # Related topics matching
            related_topics = data.get("related_topics", [])
            for topic in related_topics:
                if topic in query:
                    score += 3
            
            # Common synonyms and variations
            synonyms = {
                "treatment": ["therapy", "cure", "medicine", "medication"],
                "symptoms": ["signs", "effects", "problems"],
                "blood": ["transfusion", "donor", "bank"],
                "diet": ["food", "nutrition", "eating"],
                "types": ["kinds", "forms", "varieties"]
            }
            
            for key_word in key_words:
                if key_word in synonyms:
                    for synonym in synonyms[key_word]:
                        if synonym in query:
                            score += 7
            
            if score > 0:
                scores[key] = score
        
        # Return the highest scoring match if above threshold
        if scores:
            best_key = max(scores, key=scores.get)
            if scores[best_key] >= 5:  # Minimum threshold
                return best_key
        
        return None
    
    def _build_response(self, matched_key: str, response_data: Dict, original_query: str) -> Dict:
        """Build comprehensive response"""
        response = {
            "response": response_data["response"],
            "topic": matched_key.replace("_", " ").title(),
            "confidence": "high",
            "related_topics": response_data.get("related_topics", []),
            "severity": response_data.get("severity", "general")
        }
        
        # Add action buttons if available
        if response_data.get("action_available"):
            if "blood" in matched_key:
                response["action_button"] = {
                    "text": "Search Blood Banks",
                    "action": "blood_search",
                    "description": "Find blood banks and check availability in your area"
                }
        
        # Add follow-up suggestions
        if response_data.get("related_topics"):
            response["follow_up_questions"] = [
                f"Tell me about {topic}" for topic in response_data["related_topics"][:3]
            ]
        
        # Add severity-based additional info
        if response_data.get("severity") == "critical":
            response["important_note"] = "This information is for educational purposes. Always consult your healthcare provider for medical decisions."
        
        return response
    
    def _get_fallback_response(self, query: str) -> Dict:
        """Return fallback response when no match is found"""
        # Try to identify the general topic
        topic_hints = {
            "blood": "blood bank search or transfusion information",
            "food": "diet and nutrition for thalassemia",
            "medicine": "treatment and medication information",
            "pain": "symptoms and complications",
            "inherit": "inheritance and genetic counseling",
            "child": "pediatric thalassemia information"
        }
        
        suggested_topic = None
        for hint_key, hint_value in topic_hints.items():
            if hint_key in query:
                suggested_topic = hint_value
                break
        
        response = {
            "response": "I don't have specific information about that, but I'm here to help with thalassemia-related questions.",
            "type": "fallback",
            "confidence": "low"
        }
        
        if suggested_topic:
            response["suggestion"] = f"You might be looking for {suggested_topic}. Could you rephrase your question?"
        
        response["available_topics"] = [
            "What is thalassemia?",
            "Thalassemia symptoms and types", 
            "Treatment options",
            "Blood transfusion information",
            "Diet and nutrition advice",
            "Genetic counseling and prevention",
            "Find blood banks near you"
        ]
        
        response["help_text"] = "Try asking questions like 'What are thalassemia symptoms?' or 'How to find blood banks?'"
        
        return response
    
    def get_conversation_history(self) -> List[Dict]:
        """Get conversation history"""
        return self.conversation_history
    
    def clear_conversation(self) -> Dict:
        """Clear conversation history"""
        self.conversation_history = []
        return {"message": "Conversation history cleared", "status": "success"}