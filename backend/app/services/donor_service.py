import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
from .utils.blood_mappings import BLOOD_COMPATIBILITY, CAN_DONATE_TO

logger = logging.getLogger(__name__)

class DonorService:
    def __init__(self):
        # In-memory storage for demo (in production, use a database)
        self.donors = []
        self.donation_requests = []
        self._initialize_sample_donors()
    
    def _initialize_sample_donors(self):
        """Initialize with sample donor data for demo"""
        sample_donors = [
            {
                "id": "D001",
                "name": "Rajesh Kumar",
                "blood_group": "O+",
                "location": "Chennai, Tamil Nadu",
                "phone": "+91-9876543210",
                "email": "rajesh.k@example.com",
                "last_donation": "2024-01-15",
                "eligible_next": "2024-04-15",
                "status": "available",
                "verified": True,
                "donation_count": 5
            },
            {
                "id": "D002", 
                "name": "Priya Sharma",
                "blood_group": "A+",
                "location": "Bangalore, Karnataka",
                "phone": "+91-9876543211",
                "email": "priya.s@example.com",
                "last_donation": "2023-12-20",
                "eligible_next": "2024-03-20",
                "status": "available",
                "verified": True,
                "donation_count": 3
            },
            {
                "id": "D003",
                "name": "Mohammed Ali",
                "blood_group": "B-",
                "location": "Hyderabad, Andhra Pradesh",
                "phone": "+91-9876543212", 
                "email": "ali.m@example.com",
                "last_donation": "2024-02-01",
                "eligible_next": "2024-05-01",
                "status": "not_available",
                "verified": True,
                "donation_count": 8
            },
            {
                "id": "D004",
                "name": "Anita Reddy",
                "blood_group": "AB+",
                "location": "Chennai, Tamil Nadu",
                "phone": "+91-9876543213",
                "email": "anita.r@example.com",
                "last_donation": "2023-11-10",
                "eligible_next": "2024-02-10",
                "status": "available",
                "verified": True,
                "donation_count": 2
            },
            {
                "id": "D005",
                "name": "Vikram Singh",
                "blood_group": "O-",
                "location": "Mumbai, Maharashtra", 
                "phone": "+91-9876543214",
                "email": "vikram.s@example.com",
                "last_donation": "2024-01-05",
                "eligible_next": "2024-04-05",
                "status": "available",
                "verified": True,
                "donation_count": 12
            }
        ]
        
        self.donors.extend(sample_donors)
    
    def find_donors(self, blood_group: str, location: str, urgency: str = "normal") -> Dict:
        """Find potential donors based on criteria"""
        logger.info(f"Finding donors: {blood_group}, {location}, urgency: {urgency}")
        
        # Normalize inputs
        blood_group = blood_group.strip().upper()
        location_parts = [part.strip().lower() for part in location.split(',')]
        
        # Get compatible blood groups
        compatible_groups = BLOOD_COMPATIBILITY.get(blood_group, [blood_group])
        
        # Find matching donors
        matching_donors = []
        for donor in self.donors:
            # Check blood group compatibility
            if donor["blood_group"] not in compatible_groups:
                continue
            
            # Check location match (city or state)
            donor_location = donor["location"].lower()
            location_match = any(loc_part in donor_location for loc_part in location_parts)
            
            if not location_match:
                continue
            
            # Check availability based on urgency
            if urgency == "emergency":
                # In emergency, include all donors (they might make exception)
                pass
            elif urgency == "urgent":
                # Include available donors and those becoming eligible within 30 days
                if donor["status"] != "available":
                    eligible_date = datetime.strptime(donor["eligible_next"], "%Y-%m-%d")
                    if eligible_date > datetime.now() + timedelta(days=30):
                        continue
            else:  # normal
                # Only available donors
                if donor["status"] != "available":
                    continue
            
            # Calculate compatibility score
            donor_copy = donor.copy()
            donor_copy["compatibility_score"] = self._calculate_compatibility_score(
                donor["blood_group"], blood_group, donor["location"], location
            )
            
            # Add urgency context
            donor_copy["urgency_context"] = self._get_urgency_context(donor, urgency)
            
            matching_donors.append(donor_copy)
        
        # Sort by compatibility score and donation history
        matching_donors.sort(key=lambda d: (d["compatibility_score"], d["donation_count"]), reverse=True)
        
        return {
            "request": {
                "blood_group": blood_group,
                "location": location,
                "urgency": urgency,
                "timestamp": datetime.now().isoformat()
            },
            "compatible_blood_groups": compatible_groups,
            "donors_found": len(matching_donors),
            "donors": matching_donors[:10],  # Return top 10
            "search_tips": self._get_search_tips(blood_group, urgency),
            "emergency_alternatives": self._get_emergency_alternatives(blood_group) if urgency == "emergency" else None
        }
    
    def _calculate_compatibility_score(self, donor_bg: str, requested_bg: str, donor_loc: str, requested_loc: str) -> int:
        """Calculate compatibility score for ranking"""
        score = 0
        
        # Blood group matching (higher score for exact match)
        if donor_bg == requested_bg:
            score += 100
        elif donor_bg in BLOOD_COMPATIBILITY.get(requested_bg, []):
            score += 50
        
        # Location matching
        donor_parts = donor_loc.lower().split(', ')
        requested_parts = requested_loc.lower().split(', ')
        
        # Exact city match
        if len(donor_parts) > 0 and len(requested_parts) > 0:
            if donor_parts[0] == requested_parts[0]:
                score += 30
        
        # State match
        if len(donor_parts) > 1 and len(requested_parts) > 1:
            if donor_parts[1] == requested_parts[1]:
                score += 20
        
        return score
    
    def _get_urgency_context(self, donor: Dict, urgency: str) -> Dict:
        """Get context information based on urgency"""
        context = {"urgency_level": urgency}
        
        if urgency == "emergency":
            context["message"] = "Emergency case - donor may consider immediate donation"
            context["contact_priority"] = "immediate"
        elif urgency == "urgent":
            context["message"] = "Urgent case - please contact as soon as possible"
            context["contact_priority"] = "high"
            
            # Check if donor is eligible soon
            eligible_date = datetime.strptime(donor["eligible_next"], "%Y-%m-%d")
            days_until_eligible = (eligible_date - datetime.now()).days
            
            if days_until_eligible <= 0:
                context["availability"] = "Available now"
            elif days_until_eligible <= 30:
                context["availability"] = f"Eligible in {days_until_eligible} days"
            else:
                context["availability"] = f"Not eligible until {donor['eligible_next']}"
        else:
            context["message"] = "Regular donation request"
            context["contact_priority"] = "normal"
        
        return context
    
    def _get_search_tips(self, blood_group: str, urgency: str) -> List[str]:
        """Get search tips based on request"""
        tips = []
        
        # Blood group specific tips
        if blood_group == "O-":
            tips.append("O- is universal donor - consider expanding location search")
        elif blood_group in ["AB-", "B-"]:
            tips.append("Rare blood group - consider contacting multiple blood banks")
        
        # Urgency specific tips
        if urgency == "emergency":
            tips.extend([
                "Contact donors immediately via phone",
                "Consider nearby hospitals with donor networks",
                "Alert multiple blood banks simultaneously"
            ])
        elif urgency == "urgent":
            tips.extend([
                "Contact top-rated donors first",
                "Have backup donors ready",
                "Consider expanding search radius"
            ])
        else:
            tips.extend([
                "Plan donations in advance",
                "Build relationships with regular donors",
                "Consider organizing donation camps"
            ])
        
        return tips
    
    def _get_emergency_alternatives(self, blood_group: str) -> Dict:
        """Get emergency alternatives and contacts"""
        return {
            "compatible_groups": BLOOD_COMPATIBILITY.get(blood_group, [blood_group]),
            "emergency_contacts": {
                "National Blood Helpline": "1910",
                "Red Cross Blood Bank": "011-23711551",
                "Emergency Services": "108"
            },
            "alternative_sources": [
                "Contact nearest major hospital blood bank",
                "Reach out to medical colleges",
                "Contact voluntary blood donor organizations",
                "Consider inter-hospital blood bank transfers"
            ]
        }
    
    def register_donor(self, donor_data: dict) -> Dict:
        """Register a new blood donor"""
        try:
            # Validate required fields
            required_fields = ["name", "blood_group", "location", "phone"]
            for field in required_fields:
                if field not in donor_data or not donor_data[field]:
                    return {
                        "success": False,
                        "error": f"Missing required field: {field}",
                        "required_fields": required_fields
                    }
            
            # Generate donor ID
            donor_id = f"D{len(self.donors) + 1:03d}"
            
            # Create donor record
            new_donor = {
                "id": donor_id,
                "name": donor_data["name"],
                "blood_group": donor_data["blood_group"].strip().upper(),
                "location": donor_data["location"],
                "phone": donor_data["phone"],
                "email": donor_data.get("email", ""),
                "age": donor_data.get("age"),
                "weight": donor_data.get("weight"),
                "last_donation": donor_data.get("last_donation"),
                "medical_conditions": donor_data.get("medical_conditions", []),
                "status": "available" if not donor_data.get("last_donation") else self._calculate_status(donor_data.get("last_donation")),
                "verified": False,  # Needs verification
                "donation_count": 0,
                "registration_date": datetime.now().isoformat(),
                "eligible_next": self._calculate_next_eligible_date(donor_data.get("last_donation"))
            }
            
            # Add to donor list
            self.donors.append(new_donor)
            
            return {
                "success": True,
                "message": "Donor registered successfully",
                "donor_id": donor_id,
                "next_steps": [
                    "Verification process will be initiated",
                    "You will receive confirmation via phone/email",
                    "Keep your health records updated"
                ],
                "donor_info": {
                    "id": donor_id,
                    "name": new_donor["name"],
                    "blood_group": new_donor["blood_group"],
                    "status": new_donor["status"]
                }
            }
            
        except Exception as e:
            logger.error(f"Donor registration error: {e}")
            return {
                "success": False,
                "error": "Registration failed due to system error",
                "details": str(e)
            }
    
    def _calculate_status(self, last_donation_date: str) -> str:
        """Calculate donor status based on last donation"""
        if not last_donation_date:
            return "available"
        
        try:
            last_date = datetime.strptime(last_donation_date, "%Y-%m-%d")
            days_since = (datetime.now() - last_date).days
            
            # 3 months (90 days) cooling period
            if days_since >= 90:
                return "available"
            else:
                return "not_available"
                
        except ValueError:
            return "available"  # Default if date format is wrong
    
    def _calculate_next_eligible_date(self, last_donation_date: str) -> str:
        """Calculate next eligible donation date"""
        if not last_donation_date:
            return datetime.now().strftime("%Y-%m-%d")
        
        try:
            last_date = datetime.strptime(last_donation_date, "%Y-%m-%d")
            next_date = last_date + timedelta(days=90)  # 3 months
            return next_date.strftime("%Y-%m-%d")
        except ValueError:
            return datetime.now().strftime("%Y-%m-%d")
    
    def create_donation_request(self, request_data: dict) -> Dict:
        """Create a new blood donation request"""
        try:
            request_id = f"R{len(self.donation_requests) + 1:03d}"
            
            new_request = {
                "id": request_id,
                "patient_name": request_data.get("patient_name", "Anonymous"),
                "blood_group": request_data["blood_group"].strip().upper(),
                "location": request_data["location"],
                "urgency": request_data.get("urgency", "normal"),
                "hospital": request_data.get("hospital", ""),
                "contact_person": request_data.get("contact_person", ""),
                "contact_phone": request_data["contact_phone"],
                "units_needed": request_data.get("units_needed", 1),
                "component_type": request_data.get("component_type", "Whole Blood"),
                "needed_by": request_data.get("needed_by", ""),
                "additional_info": request_data.get("additional_info", ""),
                "status": "active",
                "created_date": datetime.now().isoformat(),
                "responses": []
            }
            
            self.donation_requests.append(new_request)
            
            # Find potential donors
            donors_result = self.find_donors(
                new_request["blood_group"],
                new_request["location"], 
                new_request["urgency"]
            )
            
            return {
                "success": True,
                "message": "Donation request created successfully",
                "request_id": request_id,
                "potential_donors": donors_result["donors_found"],
                "request_details": {
                    "id": request_id,
                    "blood_group": new_request["blood_group"],
                    "location": new_request["location"],
                    "urgency": new_request["urgency"]
                },
                "next_steps": [
                    "Potential donors will be contacted",
                    "You will receive updates on donor responses",
                    "Keep your contact information available"
                ]
            }
            
        except Exception as e:
            logger.error(f"Request creation error: {e}")
            return {
                "success": False,
                "error": "Request creation failed",
                "details": str(e)
            }
    
    def get_donor_statistics(self, location: str = None) -> Dict:
        """Get donor statistics"""
        total_donors = len(self.donors)
        
        if location:
            location_donors = [d for d in self.donors if location.lower() in d["location"].lower()]
            stats_donors = location_donors
        else:
            stats_donors = self.donors
        
        # Blood group distribution
        blood_groups = {}
        available_donors = 0
        verified_donors = 0
        
        for donor in stats_donors:
            bg = donor["blood_group"]
            blood_groups[bg] = blood_groups.get(bg, 0) + 1
            
            if donor["status"] == "available":
                available_donors += 1
            if donor["verified"]:
                verified_donors += 1
        
        return {
            "total_donors": len(stats_donors),
            "available_donors": available_donors,
            "verified_donors": verified_donors,
            "blood_group_distribution": blood_groups,
            "location_filter": location,
            "statistics_date": datetime.now().isoformat(),
            "coverage_areas": list(set(d["location"] for d in stats_donors))
        }
    
    def get_donation_requests(self, status: str = "active") -> Dict:
        """Get donation requests"""
        if status == "all":
            requests = self.donation_requests
        else:
            requests = [r for r in self.donation_requests if r["status"] == status]
        
        return {
            "total_requests": len(requests),
            "requests": requests,
            "status_filter": status,
            "last_updated": datetime.now().isoformat()
        }