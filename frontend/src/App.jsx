import { useState } from "react"
import Login from "./components/Login"
import Register from "./components/Register"
import ClientDashboard from "./pages/ClientDashboard"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  )

  const [role, setRole] = useState(
    localStorage.getItem("role")
  )

  const [page, setPage] = useState("login")

  const handleLogin = (accessToken, userRole) => {
    setToken(accessToken)
    setRole(userRole)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")

    setToken(null)
    setRole(null)
    setPage("login")
  }

  if (!token) {
    if (page === "register") {
      return (
        <Register
          onRegister={() => setPage("login")}
          onSwitchToLogin={() => setPage("login")}
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setPage("register")}
      />
    )
  }

  if (role === "client") {
    return (
      <ClientDashboard
        token={token}
        onLogout={handleLogout}
      />
    )
  }

  
  if  (role === "admin") {
  return (
    <AdminDashboard
      token={token}
      onLogout={handleLogout}
    />
  )
}
  
}

export default App