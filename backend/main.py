from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Ticket, User
from fastapi.middleware.cors import CORSMiddleware
from schemas import TicketCreate, UserCreate, UserResponse, UserLogin
from security import hash_password, verify_password, create_access_token, get_current_user, get_current_admin
from fastapi.security import OAuth2PasswordRequestForm




Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/tickets")
def create_ticket(
    ticketCreated: TicketCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    ticket = Ticket(
        title=ticketCreated.title,
        description=ticketCreated.description,
        user_id=user_id
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


@app.get("/admin/tickets")
def get_all_tickets(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    tickets = db.query(Ticket).all()

    return tickets
    
@app.get("/tickets")
def get_tickets(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    tickets = db.query(Ticket).filter(
        Ticket.user_id == user_id
    ).all()

    return tickets


@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):

        

        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found")

        return ticket

@app.put("/admin/tickets/{ticket_id}")
def update_ticket_status(
    ticket_id: int,
    ticketUpdate: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.status = ticketUpdate.status

    db.commit()
    db.refresh(ticket)

    return ticket


@app.put("/tickets/{ticket_id}")
def update_ticket(ticket_id: int, status: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    ticket.status = status
    db.commit()
    return ticket

@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return {"error": f"Ticket {ticket_id} not found"}
    db.delete(ticket)
    db.commit()
    return {"message": f"Ticket {ticket_id} deleted"}

@app.post("/register",  response_model=UserResponse)
def register_user(userCreated: UserCreate, db: Session = Depends (get_db)):

    existing_user = db.query(User).filter(User.email == userCreated.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(userCreated.password)
    user = User(
        email = userCreated.email,
        password = hashed_password,
        role = "client",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
    
@app.post("/login")
def login_user(userLogin: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == userLogin.username
    ).first()

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="User does not exist"
        )

    password_correct = verify_password(
        userLogin.password,
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

@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/admin-test")
def admin_test(
    current_admin: User = Depends(get_current_admin)
):
    return {
        "message": "You are an admin",
        "user_id": current_admin.id,
        "role": current_admin.role
    }
