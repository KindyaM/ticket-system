from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(String(500))
    status = Column(String(50), default="open")
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="tickets")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255))
    password = Column(String(255))
    role = Column(String(20))

    tickets = relationship("Ticket", back_populates="user")

