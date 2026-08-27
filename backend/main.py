from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db, Base, engine
from models import User, Ticket, TicketReply
from schemas import (
    UserCreate,
    UserResponse,
    TicketCreate,
    TicketStatusUpdate,
    TicketResponse,
    TicketReplyCreate,
    TicketReplyResponse
)

from security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin
)


Base.metadata.create_all(bind=engine)

app = FastAPI()


# -------------------------
# CORS
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# REGISTER
# -------------------------

@app.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    userCreated: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == userCreated.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(
        userCreated.password
    )

    user = User(
        email=userCreated.email,
        password=hashed_password,
        role="client"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# -------------------------
# LOGIN
# -------------------------

@app.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="User does not exist"
        )

    password_correct = verify_password(
        form_data.password,
        existing_user.password
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    access_token = create_access_token({
        "user_id": existing_user.id,
        "role": existing_user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -------------------------
# CURRENT USER
# -------------------------

@app.get("/me")
def get_me(
    current_user: int = Depends(get_current_user)
):

    return current_user


# -------------------------
# CREATE TICKET
# -------------------------

@app.post(
    "/tickets",
    response_model=TicketResponse
)
def create_ticket(
    ticketCreated: TicketCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    ticket = Ticket(
        title=ticketCreated.title,
        description=ticketCreated.description,
        status="open",
        user_id=user_id
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


# -------------------------
# GET OWN TICKETS
# -------------------------

@app.get(
    "/tickets",
    response_model=list[TicketResponse]
)
def get_tickets(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    tickets = db.query(Ticket).filter(
        Ticket.user_id == user_id
    ).all()

    return tickets


# -------------------------
# GET ONE OWN TICKET
# -------------------------

@app.get(
    "/tickets/{ticket_id}",
    response_model=TicketResponse
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.user_id == user_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


# -------------------------
# ADMIN - GET ALL TICKETS
# -------------------------

@app.get(
    "/admin/tickets",
    response_model=list[TicketResponse]
)
def get_all_tickets(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    tickets = db.query(Ticket).all()

    return tickets


# -------------------------
# ADMIN - GET ONE TICKET
# -------------------------

@app.get(
    "/admin/tickets/{ticket_id}",
    response_model=TicketResponse
)
def admin_get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


# -------------------------
# ADMIN - UPDATE STATUS
# -------------------------

@app.put(
    "/admin/tickets/{ticket_id}",
    response_model=TicketResponse
)
def update_ticket_status(
    ticket_id: int,
    ticketUpdate: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    allowed_statuses = [
        "open",
        "in progress",
        "resolved"
    ]

    if ticketUpdate.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Use: open, in progress, or resolved"
            )
        )

    ticket.status = ticketUpdate.status

    db.commit()
    db.refresh(ticket)

    return ticket


# -------------------------
# ADMIN - DELETE TICKET
# -------------------------

@app.delete("/admin/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    db.delete(ticket)
    db.commit()

    return {
        "message": "Ticket deleted successfully"
    }


# -------------------------
# ADMIN TEST
# -------------------------

@app.get("/admin-test")
def admin_test(
    current_admin: User = Depends(get_current_admin)
):

    return {
        "message": "You are an admin",
        "user_id": current_admin.id,
        "role": current_admin.role
    }

# -------------------------
# CREATE TICKET REPLY
# -------------------------

@app.post(
    "/tickets/{ticket_id}/replies",
    response_model=TicketReplyResponse
)
def create_ticket_reply(
    ticket_id: int,
    reply: TicketReplyCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.user_id == user_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    new_reply = TicketReply(
        message=reply.message,
        ticket_id=ticket_id,
        user_id=user_id
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)

    return new_reply

@app.get(
    "/tickets/{ticket_id}/replies",
    response_model=list[TicketReplyResponse]
)
def get_ticket_replies(
    ticket_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.user_id == user_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    replies = db.query(TicketReply).filter(
        TicketReply.ticket_id == ticket_id
    ).all()

    return replies

@app.post(
    "/tickets/{ticket_id}/replies",
    response_model=TicketReplyResponse
)
def create_ticket_reply(
    ticket_id: int,
    reply: TicketReplyCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    new_reply = TicketReply(
        message=reply.message,
        ticket_id=ticket_id,
        user_id=user_id
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)

    return new_reply