# backend/app/routers/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.services.auth_service import AuthService
from app.models.user import User, UserType
from app.utils.database import get_db

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    user_type: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    user_type: str
    blood_group: str
    city: str
    date_of_birth: str = None
    # Patient specific
    medical_history: str = None
    emergency_contact: str = None
    # Donor specific
    weight: int = None
    last_donation: str = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = AuthService.create_access_token(data={"sub": str(user.id)})
    refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user.to_dict()
    )

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = AuthService.get_password_hash(request.password)
    user = User(
        email=request.email,
        hashed_password=hashed_password,
        name=request.name,
        phone=request.phone,
        user_type=UserType(request.user_type),
        blood_group=request.blood_group,
        city=request.city,
        medical_history=request.medical_history,
        emergency_contact=request.emergency_contact,
        weight=request.weight,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = AuthService.create_access_token(data={"sub": str(user.id)})
    refresh_token = AuthService.create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user.to_dict()
    )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user.to_dict()

@router.post("/logout")
async def logout():
    # In a more sophisticated system, you might blacklist the token
    return {"message": "Successfully logged out"}