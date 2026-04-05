from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Ticket
from fastapi.middleware.cors import CORSMiddleware



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
def create_ticket(title: str, description: str, db: Session = Depends(get_db)):
    ticket = Ticket(title=title, description=description)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).all()

@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

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