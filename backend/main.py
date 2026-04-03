from fastapi import FastAPI

app = FastAPI()

@app.post("/tickets")
def create_ticket():
    return {"status": "ticket created"}

@app. get("/tickets")
def get_tickets():
    return tickets

@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: int):
    return {"ticket_id": ticket_id} 