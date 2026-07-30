import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { GoogleOAuthProvider } from "@react-oauth/google"
import App from "./app/App.tsx"
import AppProviders from "./context/AppProviders.tsx"
import { GOOGLE_CLIENT_ID } from "./config/env"
import { applyTheme, getSavedTheme } from "./lib/theme"
import "./index.css"

applyTheme(getSavedTheme())

const root = document.getElementById("root")!
const clientId = GOOGLE_CLIENT_ID.trim()

const tree = (
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)

createRoot(root).render(
  clientId ? <GoogleOAuthProvider clientId={clientId}>{tree}</GoogleOAuthProvider> : tree
)
