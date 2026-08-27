
import { useEffect, useMemo, useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function AdminDashboard({ token, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replies, setReplies] = useState([])

  const [replyMessage, setReplyMessage] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [activeStat, setActiveStat] = useState("all")


  // =========================================================
  // FETCH TICKETS
  // =========================================================

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


  // =========================================================
  // CLEAR SUCCESS MESSAGE
  // =========================================================

  useEffect(() => {
    if (!success) return

    const timer = setTimeout(() => {
      setSuccess("")
    }, 3000)

    return () => clearTimeout(timer)
  }, [success])


  // =========================================================
  // TICKET COUNTS
  // =========================================================

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


  // =========================================================
  // FILTERED TICKETS
  // =========================================================

  const filteredTickets = useMemo(() => {

    return tickets.filter(ticket => {

      const search = searchTerm.toLowerCase().trim()

      const matchesSearch =
        !search ||
        ticket.title?.toLowerCase().includes(search) ||
        ticket.description?.toLowerCase().includes(search) ||
        String(ticket.id).includes(search) ||
        String(ticket.user_id).includes(search)

      const ticketStatus =
        ticket.status?.toLowerCase()

      const matchesStatus =
        statusFilter === "all" ||
        ticketStatus === statusFilter

      const matchesStat =
        activeStat === "all" ||
        ticketStatus === activeStat

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStat
      )
    })

  }, [
    tickets,
    searchTerm,
    statusFilter,
    activeStat
  ])


  // =========================================================
  // STAT CARD CLICK
  // =========================================================

  const handleStatClick = (status) => {

    setActiveStat(status)

    if (status === "all") {
      setStatusFilter("all")
    } else {
      setStatusFilter(status)
    }
  }


  // =========================================================
  // OPEN TICKET
  // =========================================================

  const openTicket = async (ticket) => {

    setSelectedTicket(ticket)

    setReplies([])

    setReplyMessage("")

    setError("")

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

      setError(
        err.response?.data?.detail ||
        "Unable to load conversation"
      )
    }
  }


  // =========================================================
  // SEND ADMIN REPLY
  // =========================================================

  const sendReply = async () => {

    if (!replyMessage.trim()) return

    if (!selectedTicket) return

    setSendingReply(true)

    setError("")

    try {

      await axios.post(
        `${API}/admin/tickets/${selectedTicket.id}/replies`,
        {
          message: replyMessage.trim()
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

      setSuccess("Reply sent successfully")

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Unable to send reply"
      )

    } finally {

      setSendingReply(false)
    }
  }


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
    ticketId,
    currentStatus
  ) => {

    const status =
      currentStatus?.toLowerCase()

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

      if (
        selectedTicket?.id === ticketId
      ) {

        setSelectedTicket(prev => ({
          ...prev,
          status: newStatus
        }))
      }

      setSuccess(
        `Ticket marked as ${newStatus}`
      )

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Unable to update ticket"
      )
    }
  }


  // =========================================================
  // DELETE TICKET
  // =========================================================

  const deleteTicket = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this ticket?"
      )

    if (!confirmed) return

    try {

      await axios.delete(
        `${API}/admin/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (
        selectedTicket?.id === id
      ) {

        setSelectedTicket(null)
        setReplies([])
      }

      await fetchTickets()

      setSuccess(
        "Ticket deleted successfully"
      )

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Unable to delete ticket"
      )
    }
  }


  // =========================================================
  // STATUS BUTTON TEXT
  // =========================================================

  const getStatusButtonText = (
    status
  ) => {

    const currentStatus =
      status?.toLowerCase()

    if (
      currentStatus === "open"
    ) {
      return "Start Progress"
    }

    if (
      currentStatus === "in progress"
    ) {
      return "Resolve"
    }

    return "Reopen"
  }


  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {

    const currentStatus =
      status?.toLowerCase()

    if (currentStatus === "open") {
      return "●"
    }

    if (currentStatus === "in progress") {
      return "◐"
    }

    return "✓"
  }


  return (

    <div className="dashboard admin-dashboard">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="dashboard-header">

        <div>

          <div className="admin-title-row">

            <div className="admin-logo">
              ⚡
            </div>

            <div>

              <h1>
                Admin Dashboard
              </h1>

              <p>
                Manage and respond to support tickets.
              </p>

            </div>

          </div>

        </div>


        <button
          onClick={onLogout}
          className="logout-button"
        >
          Logout
        </button>

      </header>


      {/* =====================================================
          NOTIFICATIONS
          ===================================================== */}

      {success && (

        <div className="success-message">

          <span>✓</span>

          {success}

        </div>

      )}


      {error && (

        <div className="error-message">

          {error}

        </div>

      )}


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="ticket-stats">


        <button
          className={`stat-card ${
            activeStat === "all"
              ? "stat-active"
              : ""
          }`}
          onClick={() =>
            handleStatClick("all")
          }
        >

          <span>
            Total tickets
          </span>

          <strong>
            {tickets.length}
          </strong>

          <small>
            All submitted tickets
          </small>

        </button>


        <button
          className={`stat-card ${
            activeStat === "open"
              ? "stat-active"
              : ""
          }`}
          onClick={() =>
            handleStatClick("open")
          }
        >

          <span>
            Open
          </span>

          <strong>
            {openTickets}
          </strong>

          <small>
            Awaiting action
          </small>

        </button>


        <button
          className={`stat-card ${
            activeStat === "in progress"
              ? "stat-active"
              : ""
          }`}
          onClick={() =>
            handleStatClick("in progress")
          }
        >

          <span>
            In Progress
          </span>

          <strong>
            {inProgressTickets}
          </strong>

          <small>
            Currently being handled
          </small>

        </button>


        <button
          className={`stat-card ${
            activeStat === "resolved"
              ? "stat-active"
              : ""
          }`}
          onClick={() =>
            handleStatClick("resolved")
          }
        >

          <span>
            Resolved
          </span>

          <strong>
            {resolvedTickets}
          </strong>

          <small>
            Successfully completed
          </small>

        </button>

      </div>


      {/* =====================================================
          TICKET DETAILS
          ===================================================== */}

      {selectedTicket ? (

        <section className="ticket-details-section">


          <button
            onClick={() => {

              setSelectedTicket(null)

              setReplies([])

              setReplyMessage("")

              setError("")
            }}
            className="back-button"
          >
            ← Back to tickets
          </button>


          <div className="ticket-details-card">


            {/* HEADER */}

            <div className="ticket-details-header">

              <div>

                <span className="ticket-number">
                  TICKET #{selectedTicket.id}
                </span>

                <h2>
                  {selectedTicket.title}
                </h2>

                <small>
                  Submitted by User #{selectedTicket.user_id}
                </small>

              </div>


              <span
                className={`status-badge status-${selectedTicket.status
                  ?.toLowerCase()
                  .replace(" ", "-")}`}
              >

                <span>
                  {getStatusIcon(
                    selectedTicket.status
                  )}
                </span>

                {selectedTicket.status}

              </span>

            </div>


            {/* DESCRIPTION */}

            <div className="ticket-description-box">

              <span>
                DESCRIPTION
              </span>

              <p className="ticket-details-description">
                {selectedTicket.description}
              </p>

            </div>


            <hr />


            {/* CONVERSATION */}

            <div className="conversation-header">

              <div>

                <h3>
                  Conversation
                </h3>

                <p>
                  Communication between client and support
                </p>

              </div>

              <span className="reply-count">
                {replies.length}{" "}
                {replies.length === 1
                  ? "message"
                  : "messages"}
              </span>

            </div>


            <div className="reply-list">

              {replies.length === 0 ? (

                <div className="conversation-empty">

                  <div>
                    💬
                  </div>

                  <strong>
                    No replies yet
                  </strong>

                  <p>
                    Start the conversation by replying below.
                  </p>

                </div>

              ) : (

                replies.map(reply => (

                  <div
                    key={reply.id}
                    className={`reply-card ${
                      reply.user_id ===
                      selectedTicket.user_id
                        ? "client-reply"
                        : "admin-reply"
                    }`}
                  >

                    <div className="reply-header">

                      <strong>
                        {reply.user_id ===
                        selectedTicket.user_id
                          ? "Client"
                          : "Support Admin"}
                      </strong>

                      <span>
                        {reply.user_id ===
                        selectedTicket.user_id
                          ? "Customer"
                          : "Support"}
                      </span>

                    </div>

                    <p>
                      {reply.message}
                    </p>

                  </div>

                ))

              )}

            </div>


            {/* REPLY FORM */}

            {selectedTicket.status
              ?.toLowerCase() ===
            "resolved" ? (

              <div className="resolved-message">

                <span>
                  ✓
                </span>

                This ticket has been resolved.

              </div>

            ) : (

              <div className="reply-form">

                <div>

                  <label>
                    Reply to client
                  </label>

                  <textarea
                    placeholder="Write your response..."
                    value={replyMessage}
                    onChange={(e) =>
                      setReplyMessage(
                        e.target.value
                      )
                    }
                    rows="4"
                  />

                </div>


                <button
                  onClick={sendReply}
                  className="primary-button"
                  disabled={
                    sendingReply ||
                    !replyMessage.trim()
                  }
                >

                  {sendingReply
                    ? "Sending..."
                    : "Send Reply →"}

                </button>

              </div>

            )}

          </div>

        </section>

      ) : (


        /* =====================================================
           TICKET LIST
           ===================================================== */

        <section className="tickets-section">


          <div className="tickets-heading">

            <div>

              <h2>
                Support tickets
              </h2>

              <p>
                Search, filter and manage submitted tickets.
              </p>

            </div>


            <button
              onClick={fetchTickets}
              className="refresh-button"
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </div>


          {/* SEARCH */}

          <div className="ticket-filters">

            <div className="search-wrapper">

              <span className="search-icon">
                🔎
              </span>

              <input
                type="text"
                className="ticket-search"
                placeholder="Search tickets, users or descriptions..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => {

                setStatusFilter(
                  e.target.value
                )

                setActiveStat(
                  e.target.value
                )
              }}
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


          {/* RESULTS */}

          {!loading &&
            searchTerm && (

            <div className="search-results">

              Showing{" "}
              <strong>
                {filteredTickets.length}
              </strong>{" "}
              matching{" "}
              {filteredTickets.length === 1
                ? "ticket"
                : "tickets"}

            </div>

          )}


          {/* LOADING */}

          {loading ? (

            <div className="loading-state">

              <div className="loading-spinner">
                ⟳
              </div>

              <p>
                Loading tickets...
              </p>

            </div>

          ) : filteredTickets.length === 0 ? (

            /* EMPTY */

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

              {(searchTerm ||
                statusFilter !== "all") && (

                <button
                  className="clear-filter-button"
                  onClick={() => {

                    setSearchTerm("")

                    setStatusFilter("all")

                    setActiveStat("all")
                  }}
                >
                  Clear filters
                </button>

              )}

            </div>

          ) : (

            <div className="ticket-list">

              {filteredTickets.map(
                (ticket, index) => (

                  <div
                    key={ticket.id}
                    className="ticket-card admin-ticket-card"
                    style={{
                      animationDelay:
                        `${index * 0.04}s`
                    }}
                    onClick={() =>
                      openTicket(ticket)
                    }
                  >


                    {/* TICKET INFO */}

                    <div className="ticket-info">

                      <div className="ticket-meta">

                        <span className="ticket-number">
                          #{ticket.id}
                        </span>

                        <span className="ticket-user">
                          User #{ticket.user_id}
                        </span>

                      </div>

                      <h3>
                        {ticket.title}
                      </h3>

                      <p>
                        {ticket.description}
                      </p>

                    </div>


                    {/* ACTIONS */}

                    <div className="admin-ticket-actions">

                      <span
                        className={`status-badge status-${ticket.status
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                      >

                        <span>
                          {getStatusIcon(
                            ticket.status
                          )}
                        </span>

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

                          deleteTicket(
                            ticket.id
                          )
                        }}
                        className="delete-button"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      )}

    </div>
  )
}

export default AdminDashboard

