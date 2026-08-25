import { useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const formData = new URLSearchParams()

      formData.append("username", email)
      formData.append("password", password)

      const response = await axios.post(
        `${API}/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      )

      const accessToken = response.data.access_token

      const payload = JSON.parse(
        atob(accessToken.split(".")[1])
      )

      localStorage.setItem("token", accessToken)
      localStorage.setItem("role", payload.role)

      onLogin(accessToken, payload.role)

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Invalid email or password"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">
          <div className="logo">🎫</div>

          <h1>Welcome back</h1>

          <p>
            Sign in to your ticket account
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

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
              placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={onSwitchToRegister}
            className="link-button"
          >
            Create one
          </button>
        </div>

      </div>

    </div>
  )
}

export default Login