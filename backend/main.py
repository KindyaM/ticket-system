from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Ticket, User
from fastapi.middleware.cors import CORSMiddleware
from schemas import TicketCreate, UserCreate, UserResponse, UserLogin
from security import hash_password, verify_password




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
def create_ticket(ticketCreated: TicketCreate, db: Session = Depends(get_db)):
    ticket = Ticket(
    title=ticketCreated.title,
    description=ticketCreated.description
)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).all()

@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):

        

        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found")

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
def login_user(userLogin: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == userLogin.email
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

    return existing_user