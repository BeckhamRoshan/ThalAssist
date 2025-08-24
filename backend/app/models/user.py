# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text
from sqlalchemy.sql import func
from app.utils.database import Base 
from sqlalchemy.ext.declarative import declarative_base
import enum

class UserType(enum.Enum):
    DONOR = "donor"
    PATIENT = "patient"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    user_type = Column(Enum(UserType), nullable=False)
    blood_group = Column(String, nullable=False)
    city = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    
    # Common fields
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Patient specific fields
    medical_history = Column(Text, nullable=True)
    emergency_contact = Column(String, nullable=True)
    last_transfusion = Column(DateTime, nullable=True)
    urgency_level = Column(String, default="Low")
    
    # Donor specific fields
    weight = Column(Integer, nullable=True)
    last_donation = Column(DateTime, nullable=True)
    total_donations = Column(Integer, default=0)
    next_eligible_date = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "userType": self.user_type.value,
            "bloodGroup": self.blood_group,
            "city": self.city,
            "dateOfBirth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "isActive": self.is_active,
            "isVerified": self.is_verified,
            "joinDate": self.created_at.isoformat(),
            # Patient fields
            "medicalHistory": self.medical_history,
            "emergencyContact": self.emergency_contact,
            "lastTransfusion": self.last_transfusion.isoformat() if self.last_transfusion else None,
            "urgencyLevel": self.urgency_level,
            # Donor fields
            "weight": self.weight,
            "lastDonation": self.last_donation.isoformat() if self.last_donation else None,
            "totalDonations": self.total_donations,
            "nextEligible": self.next_eligible_date.isoformat() if self.next_eligible_date else None,
        }