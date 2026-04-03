from fastapi import FastAPI

app = FastAPI()

@app.post("/tickets")
def create_ticket():
    return {"status": "ticket created"}
