from pydantic import BaseModel, Field

class TicketCreate(BaseModel):
    title: str = Field(..., min_length = 1)
    description: str = Field(..., min_length = 1)

class UserCreate(BaseModel):
    email: str = Field(..., min_length = 1, example = "user@example.com")
    password: str = Field(..., min_length = 1, example = "mypassword@123")
       

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class TicketStatusUpdate(BaseModel):
    status: str = Field(...)