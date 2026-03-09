import { GraduationCap, Home } from "lucide-react"
import { useEffect, useState } from "react"

type Props = {
  setPage: (page: "home" | "login" | "signup" | "dashboard") => void
}

export default function Navbar({ setPage }: Props) {

  const [activeSection, setActiveSection] = useState("home")
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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

  useEffect(() => {
    const status = localStorage.getItem("spa_loggedin")
    setIsLoggedIn(status === "true")
  }, [])

  useEffect(() => {

    const sections = ["home","features","about","contact"]

    const handleScroll = () => {

      let current = "home"

      sections.forEach((section) => {

        const element = document.getElementById(section)

        if (element) {

          const rect = element.getBoundingClientRect()

          if (rect.top <= 150) {
            current = section
          }

        }

      })

      setActiveSection(current)

    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  useEffect(() => {

    const handleScroll = () => {

      const scrollTop = window.scrollY
      const height = document.body.scrollHeight - window.innerHeight

      const progress = (scrollTop / height) * 100

      setScrollProgress(progress)

    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  return (

<header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm">

<div className="h-1 bg-gray-200 w-full">
<div
className="h-1 bg-gradient-to-r from-indigo-600 to-blue-600"
style={{ width: `${scrollProgress}%` }}
/>
</div>

<div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

<div
className="flex items-center gap-3 cursor-pointer"
onClick={handleHomeClick}
>
<div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
<GraduationCap className="text-white w-5 h-5"/>
</div>

<span className="font-bold text-gray-900">
Student Performance Analyzer
</span>
</div>

<div className="hidden md:flex items-center gap-8 font-medium">

<button
onClick={handleHomeClick}
className={`flex items-center gap-2 transition ${
activeSection === "home"
? "text-indigo-600"
: "text-gray-600 hover:text-gray-900"
}`}
>
<Home className="w-4 h-4"/>
Home
</button>

<button
onClick={() => scrollToSection("features")}
className={`transition ${
activeSection === "features"
? "text-indigo-600"
: "text-gray-600 hover:text-gray-900"
}`}
>
Features
</button>

<button
onClick={() => scrollToSection("about")}
className={`transition ${
activeSection === "about"
? "text-indigo-600"
: "text-gray-600 hover:text-gray-900"
}`}
>
About
</button>

<button
onClick={() => scrollToSection("contact")}
className={`transition ${
activeSection === "contact"
? "text-indigo-600"
: "text-gray-600 hover:text-gray-900"
}`}
>
Contact
</button>

</div>

<div className="flex gap-4 items-center">

{!isLoggedIn && (

<>
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
</>

)}

{isLoggedIn && (

<>
<button
onClick={() => setPage("dashboard")}
className="text-gray-600 hover:text-gray-900 transition"
>
Dashboard
</button>

<button
onClick={()=>{
localStorage.removeItem("spa_loggedin")
setIsLoggedIn(false)
setPage("home")
}}
className="px-4 py-2 rounded-xl bg-red-500 text-white"
>
Logout
</button>
</>

)}

</div>

</div>

</header>

  )

}