import { ToastProvider } from "./ToastContext"
import { UserProvider } from "./UserContext"

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UserProvider>{children}</UserProvider>
    </ToastProvider>
  )
}
