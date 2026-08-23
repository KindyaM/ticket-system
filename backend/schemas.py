from pydantic import BaseModel, Field

class TicketCreate(BaseModel):
    title: str = Field(..., min_length = 1)
    description: str = Field(..., min_length = 1)

class UserCreate(BaseModel):
    email: str = Field(..., min_length = 1)
    password: str = Field(..., min_length = 1)
    role: str = Field(...)    
