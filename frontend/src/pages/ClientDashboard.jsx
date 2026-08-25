import { useEffect, useState } from "react"
import axios from "axios"
import TicketCard from "../components/TicketCard"

const API = "http://localhost:8000"

function ClientDashboard({ token, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `${API}/tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setTickets(response.data)
      setError("")

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load tickets"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const createTicket = async (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      setError("Please enter a title and description.")
      return
    }

    try {
      setCreating(true)
      setError("")

      await axios.post(
        `${API}/tickets`,
        {
          title,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setTitle("")
      setDescription("")
      setShowForm(false)

      await fetchTickets()

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to create ticket"
      )
    } finally {
      setCreating(false)
    }
  }

  const openTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "open"
  ).length

  const closedTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "closed"
  ).length

  return (
    <div className="dashboard">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <h1>My Tickets</h1>

          <p>
            Track and manage your support requests.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="logout-button"
        >
          Logout
        </button>

      </header>


      {/* STATS */}

      <div className="ticket-stats">

        <div className="stat-card">
          <span>Total tickets</span>
          <strong>{tickets.length}</strong>
        </div>

        <div className="stat-card">
          <span>Open</span>
          <strong>{openTickets}</strong>
        </div>

        <div className="stat-card">
          <span>Closed</span>
          <strong>{closedTickets}</strong>
        </div>

      </div>


      {/* TICKETS */}

      <section className="tickets-section">

        <div className="tickets-heading">

          <div>
            <h2>Your tickets</h2>

            <p>
              All your submitted support requests
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm)
              setError("")
            }}
            className="primary-button new-ticket-button"
          >
            + New Ticket
          </button>

        </div>


        {/* CREATE TICKET FORM */}

        {showForm && (

          <div className="create-ticket-card">

            <div className="create-ticket-header">

              <h2>New Ticket</h2>

              <button
                onClick={() => setShowForm(false)}
                className="close-button"
              >
                ×
              </button>

            </div>

            <form onSubmit={createTicket}>

              <div className="form-group">

                <label>Title</label>

                <input
                  type="text"
                  placeholder="Briefly describe your issue"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />

              </div>


              <div className="form-group">

                <label>Description</label>

                <textarea
                  placeholder="Tell us more about the issue..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows="5"
                />

              </div>


              <div className="form-actions">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating
                    ? "Submitting..."
                    : "Submit Ticket"}
                </button>

              </div>

            </form>

          </div>

        )}


        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* TICKET LIST */}

        {loading ? (

          <div className="empty-state">
            <p>Loading your tickets...</p>
          </div>

        ) : tickets.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🎫
            </div>

            <h3>No tickets yet</h3>

            <p>
              You haven't submitted a support request yet.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="primary-button"
            >
              Create your first ticket
            </button>

          </div>

        ) : (

          <div className="ticket-list">

            {tickets.map(ticket => (

              <TicketCard
                key={ticket.id}
                ticket={ticket}
              />

            ))}

          </div>

        )}

      </section>

    </div>
  )
}

export default ClientDashboard