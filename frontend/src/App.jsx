import { useEffect, useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function App() {
  const [tickets, setTickets] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const fetchTickets = () => {
    axios.get(`${API}/tickets`).then(res => setTickets(res.data))
  }

  useEffect(() => { fetchTickets() }, [])

  const createTicket = () => {
    if (!title) return
    axios.post(`${API}/tickets?title=${title}&description=${description}`)
      .then(() => { fetchTickets(); setTitle(""); setDescription("") })
  }

  const updateStatus = (id, status) => {
    const newStatus = status === "open" ? "closed" : "open"
    axios.put(`${API}/tickets/${id}?status=${newStatus}`)
      .then(fetchTickets)
  }

  const deleteTicket = (id) => {
    axios.delete(`${API}/tickets/${id}`).then(fetchTickets)
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>🎫 Ticket System</h1>

      <div style={{ background: "#1e1e1e", padding: 20, borderRadius: 8, marginBottom: 24 }}>
        <h2>New Ticket</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
        />
        <button onClick={createTicket} style={{ padding: "8px 16px", background: "#4f9" , border: "none", borderRadius: 4, cursor: "pointer" }}>
          Create Ticket
        </button>
      </div>

      {tickets.map(ticket => (
        <div key={ticket.id} style={{ background: "#1e1e1e", padding: 16, borderRadius: 8, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>#{ticket.id} - {ticket.title}</strong>
            <p style={{ margin: "4px 0", color: "#aaa" }}>{ticket.description}</p>
            <span style={{ color: ticket.status === "open" ? "#4f9" : "#f66" }}>{ticket.status}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => updateStatus(ticket.id, ticket.status)} style={{ padding: "6px 12px", cursor: "pointer" }}>
              {ticket.status === "open" ? "Close" : "Reopen"}
            </button>
            <button onClick={() => deleteTicket(ticket.id)} style={{ padding: "6px 12px", background: "#f66", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App