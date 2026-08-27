from pydantic import BaseModel, Field, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        orm_mode = True


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)


class TicketStatusUpdate(BaseModel):
    status: str


class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    user_id: int

    class Config:
        orm_mode = True

class TicketReplyCreate(BaseModel):
    message: str


class TicketReplyResponse(BaseModel):
    id: int
    message: str
    ticket_id: int
    user_id: int

    class Config:
        orm_mode = True 

class TicketReplyCreate(BaseModel):
    message: str


