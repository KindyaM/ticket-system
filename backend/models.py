from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(50), default="client")

    tickets = relationship("Ticket", back_populates="user")
    ticket_replies = relationship(
    "TicketReply",
    back_populates="user"
)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(String(500))
    status = Column(String(50), default="open")
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="tickets")
    replies = relationship(
    "TicketReply",
    back_populates="ticket",
    cascade="all, delete-orphan"
)

class TicketReply(Base):
    __tablename__ = "ticket_replies"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(1000), nullable=False)

    ticket_id = Column(
        Integer,
        ForeignKey("tickets.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    ticket = relationship(
        "Ticket",
        back_populates="replies"
    )

    user = relationship(
        "User",
        back_populates="ticket_replies"
    )