import { useState } from "react"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"

export type Page = "home" | "login" | "signup" | "dashboard"

export default function App() {
  const [page, setPage] = useState<Page>("home")

  return (
    <>
      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </>
  )
}