import { useEffect, useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function AdminDashboard({ token, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyMessage, setReplyMessage] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // -------------------------
  // FETCH TICKETS
  // -------------------------

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

  // -------------------------
  // TICKET COUNTS
  // -------------------------

  const openTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "open"
  ).length

  const inProgressTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "in progress"
  ).length

  const resolvedTickets = tickets.filter(
    ticket =>
      ticket.status?.toLowerCase() === "resolved"
  ).length

  // -------------------------
  // SEARCH + FILTER
  // -------------------------

  const filteredTickets = tickets.filter(ticket => {
    const search = searchTerm.toLowerCase().trim()

    const matchesSearch =
      ticket.title?.toLowerCase().includes(search) ||
      ticket.description?.toLowerCase().includes(search) ||
      String(ticket.id).includes(search) ||
      String(ticket.user_id).includes(search)

    const matchesStatus =
      statusFilter === "all" ||
      ticket.status?.toLowerCase() === statusFilter

    return matchesSearch && matchesStatus
  })

  // -------------------------
  // OPEN TICKET
  // -------------------------

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket)
    setReplies([])
    setReplyMessage("")

    try {
      const response = await axios.get(
        `${API}/admin/tickets/${ticket.id}/replies`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setReplies(response.data)

    } catch (err) {
      console.error(
        "ERROR LOADING REPLIES:",
        err.response?.data || err
      )
    }
  }

  // -------------------------
  // SEND ADMIN REPLY
  // -------------------------

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) {
      return
    }

    try {
      await axios.post(
        `${API}/admin/tickets/${selectedTicket.id}/replies`,
        {
          message: replyMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setReplyMessage("")

      const response = await axios.get(
        `${API}/admin/tickets/${selectedTicket.id}/replies`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setReplies(response.data)

    } catch (err) {
      console.error(
        "ERROR SENDING REPLY:",
        err.response?.data || err
      )
    }
  }

  // -------------------------
  // UPDATE STATUS
  // -------------------------

  const updateStatus = async (ticketId, currentStatus) => {
    const status = currentStatus?.toLowerCase()

    let newStatus

    if (status === "open") {
      newStatus = "in progress"
    } else if (status === "in progress") {
      newStatus = "resolved"
    } else {
      newStatus = "open"
    }

    try {
      await axios.put(
        `${API}/admin/tickets/${ticketId}`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      await fetchTickets()

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({
          ...prev,
          status: newStatus
        }))
      }

    } catch (err) {
      console.error(
        "ERROR UPDATING STATUS:",
        err.response?.data || err
      )
    }
  }

  // -------------------------
  // DELETE TICKET
  // -------------------------

  const deleteTicket = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    )

    if (!confirmed) {
      return
    }

    try {
      await axios.delete(
        `${API}/admin/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (selectedTicket?.id === id) {
        setSelectedTicket(null)
        setReplies([])
        setReplyMessage("")
      }

      await fetchTickets()

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to delete ticket"
      )
    }
  }

  // -------------------------
  // STATUS BUTTON TEXT
  // -------------------------

  const getStatusButtonText = (status) => {
    const currentStatus = status?.toLowerCase()

    if (currentStatus === "open") {
      return "Start Progress"
    }

    if (currentStatus === "in progress") {
      return "Resolve"
    }

    return "Reopen"
  }

  // -------------------------
  // CLOSE TICKET
  // -------------------------

  const closeTicket = () => {
    setSelectedTicket(null)
    setReplies([])
    setReplyMessage("")
  }

  // -------------------------
  // RENDER
  // -------------------------

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
          <span>In Progress</span>
          <strong>{inProgressTickets}</strong>
        </div>

        <div className="stat-card">
          <span>Resolved</span>
          <strong>{resolvedTickets}</strong>
        </div>

      </div>


      {/* SELECTED TICKET */}

      {selectedTicket ? (

        <section className="ticket-details-section">

          <button
            onClick={closeTicket}
            className="back-button"
          >
            ← Back to tickets
          </button>

          <div className="ticket-details-card">

            {/* TICKET HEADER */}

            <div className="ticket-details-header">

              <div>

                <span className="ticket-number">
                  #{selectedTicket.id}
                </span>

                <h2>
                  {selectedTicket.title}
                </h2>

                <small>
                  User ID: {selectedTicket.user_id}
                </small>

              </div>

              <span
                className={`status-badge status-${selectedTicket.status
                  ?.toLowerCase()
                  .replace(" ", "-")}`}
              >
                {selectedTicket.status}
              </span>

            </div>


            {/* DESCRIPTION */}

            <p className="ticket-details-description">
              {selectedTicket.description}
            </p>


            <hr />


            {/* CONVERSATION */}

            <h3>
              Conversation
            </h3>

            <div className="reply-list">

              {replies.length === 0 ? (

                <p>
                  No replies yet.
                </p>

              ) : (

                replies.map(reply => {

                  const isClient =
                    reply.user_id === selectedTicket.user_id

                  return (
                    <div
                      key={reply.id}
                      className={`reply-card ${
                        isClient
                          ? "client-reply"
                          : "admin-reply"
                      }`}
                    >

                      <strong>
                        {isClient
                          ? "Client"
                          : "Admin"}
                      </strong>

                      <p>
                        {reply.message}
                      </p>

                    </div>
                  )

                })

              )}

            </div>


            {/* REPLY FORM */}

            {selectedTicket.status?.toLowerCase() === "resolved" ? (

              <div className="resolved-message">
                This ticket has been resolved.
              </div>

            ) : (

              <div className="reply-form">

                <textarea
                  placeholder="Reply to the client..."
                  value={replyMessage}
                  onChange={(e) =>
                    setReplyMessage(e.target.value)
                  }
                  rows="4"
                />

                <button
                  onClick={sendReply}
                  className="primary-button"
                >
                  Send Reply
                </button>

              </div>

            )}

          </div>

        </section>

      ) : (

        /* TICKET LIST */

        <section className="tickets-section">

          <div className="tickets-heading">

            <div>

              <h2>
                All tickets
              </h2>

              <p>
                Manage tickets submitted by users
              </p>

            </div>

            <button
              onClick={fetchTickets}
              className="refresh-button"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>


          {/* SEARCH + FILTER */}

          <div className="ticket-filters">

            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="ticket-search"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="status-filter"
            >

              <option value="all">
                All statuses
              </option>

              <option value="open">
                Open
              </option>

              <option value="in progress">
                In Progress
              </option>

              <option value="resolved">
                Resolved
              </option>

            </select>

          </div>


          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          {/* LOADING */}

          {loading ? (

            <div className="empty-state">

              <p>
                Loading tickets...
              </p>

            </div>

          ) : tickets.length === 0 ? (

            /* NO TICKETS */

            <div className="empty-state">

              <div className="empty-icon">
                🎫
              </div>

              <h3>
                No tickets
              </h3>

              <p>
                There are currently no support tickets.
              </p>

            </div>

          ) : filteredTickets.length === 0 ? (

            /* NO SEARCH RESULTS */

            <div className="empty-state">

              <div className="empty-icon">
                🔎
              </div>

              <h3>
                No matching tickets
              </h3>

              <p>
                Try changing your search or filter.
              </p>

            </div>

          ) : (

            /* TICKET LIST */

            <div className="ticket-list">

              {filteredTickets.map(ticket => (

                <div
                  key={ticket.id}
                  className="ticket-card admin-ticket-card"
                  onClick={() => openTicket(ticket)}
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
                      onClick={(e) => {
                        e.stopPropagation()

                        updateStatus(
                          ticket.id,
                          ticket.status
                        )
                      }}
                      className="action-button"
                    >
                      {getStatusButtonText(
                        ticket.status
                      )}
                    </button>


                    <button
                      onClick={(e) => {
                        e.stopPropagation()

                        deleteTicket(ticket.id)
                      }}
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

      )}

    </div>
  )
}

export default AdminDashboard