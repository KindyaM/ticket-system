function TicketCard({ ticket, onClick }) {
  return (
    <div className="ticket-card" onClick={onClick}>

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

      </div>

      <span
        className={`status-badge status-${ticket.status
          ?.toLowerCase()
          .replace(" ", "-")}`}
      >
        {ticket.status}
      </span>

    </div>
  )
}

export default TicketCard