import { useEffect, useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function AdminDashboard({ token, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchTickets = async () => {
    try {
      setError("")

      const response = await axios.get(
        `${API}/admin/tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setTickets(response.data)

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

  const openTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "open"
  ).length

  const closedTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "closed"
  ).length

  const updateStatus = async (ticket) => {
    const newStatus =
      ticket.status?.toLowerCase() === "open"
        ? "closed"
        : "open"

    try {
      await axios.put(
        `${API}/tickets/${ticket.id}?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchTickets()

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to update ticket"
      )
    }
  }

  const deleteTicket = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    )

    if (!confirmed) return

    try {
      await axios.delete(
        `${API}/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchTickets()

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to delete ticket"
      )
    }
  }

  return (
    <div className="dashboard">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Manage and respond to support tickets.
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
            <h2>All tickets</h2>

            <p>
              Manage tickets submitted by users
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="refresh-button"
          >
            Refresh
          </button>

        </div>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {loading ? (

          <div className="empty-state">
            <p>Loading tickets...</p>
          </div>

        ) : tickets.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🎫
            </div>

            <h3>No tickets</h3>

            <p>
              There are currently no support tickets.
            </p>

          </div>

        ) : (

          <div className="ticket-list">

            {tickets.map(ticket => (

              <div
                key={ticket.id}
                className="ticket-card admin-ticket-card"
              >

                <div className="ticket-info">

                  <span className="ticket-number">
                    #{ticket.id}
                  </span>

                  <h3>
                    {ticket.title}
                  </h3>

                  <p>
                    {ticket.description}
                  </p>

                  <small>
                    User ID: {ticket.user_id}
                  </small>

                </div>


                <div className="admin-ticket-actions">

                  <span
                    className={`status-badge status-${ticket.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>

                  <button
                    onClick={() =>
                      updateStatus(ticket)
                    }
                    className="action-button"
                  >
                    {ticket.status?.toLowerCase() === "open"
                      ? "Close"
                      : "Reopen"}
                  </button>

                  <button
                    onClick={() =>
                      deleteTicket(ticket.id)
                    }
                    className="delete-button"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  )
}

export default AdminDashboard