import { useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function Register({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      await axios.post(`${API}/register`, {
        email,
        password
      })

      onRegister()

    } catch (err) {
  console.error("REGISTRATION ERROR:", err.response?.data)

  const detail = err.response?.data?.detail

  if (Array.isArray(detail)) {
    setError(detail[0]?.msg || "Registration failed")
  } else {
    setError(detail || "Registration failed")
  }
}

      finally {
  setLoading(false)
}
}

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="logo">🎫</div>

          <h1>Create account</h1>

          <p>Get started with your ticket account</p>
        </div>

        {error && (
  <div className="error-message">
    {typeof error === "string"
      ? error
      : error?.msg || "Registration failed"}
  </div>
)}

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <div className="auth-switch">
          <span>Already have an account?</span>

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="link-button"
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  )
}

export default Register