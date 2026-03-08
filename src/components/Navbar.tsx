import { GraduationCap, Home } from "lucide-react"

type Props = {
  setPage: (page: "home" | "login" | "signup" | "dashboard") => void
}

export default function Navbar({ setPage }: Props) {

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleHomeClick = () => {
    setPage("home")
    setTimeout(() => scrollToSection("home"), 100)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleHomeClick}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>

          <span
            className="font-bold text-gray-900"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Student Performance Analyzer
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">

          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-gray-900 transition"
          >
            Features
          </button>

          <button
            onClick={() => scrollToSection("about")}
            className="hover:text-gray-900 transition"
          >
            About
          </button>

          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-gray-900 transition"
          >
            Contact
          </button>

        </div>

        {/* Auth Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setPage("login")}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Login
          </button>

          <button
            onClick={() => setPage("signup")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg transition"
          >
            Sign Up
          </button>
        </div>

      </div>
    </header>
  )
}