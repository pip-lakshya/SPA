import { useState } from "react"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Hub from "../pages/Hub"
import Form from "../pages/Form"
import Dashboard from "../pages/Dashboard"
import Profile from "../pages/Profile"
import AiChatbot from "../components/AiChatbot/AiChatbot"

export type Page = "home" | "login" | "signup" | "hub" | "form" | "dashboard" | "profile"

export default function App() {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem("token") ? "hub" : "home"))

  return (
    <>
      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "hub" && <Hub setPage={setPage} />}
      {page === "form" && <Form setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "profile" && <Profile setPage={setPage} />}
      <AiChatbot />
    </>
  )
}
