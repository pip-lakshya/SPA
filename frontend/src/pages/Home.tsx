import { useEffect } from "react"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import KeyFeatures from "../components/KeyFeatures"
import AboutSection from "../components/AboutSection"
import ContactSection from "../components/ContactSection"
import Footer from "../components/Footer"
import type { Page } from "../app/App"

type Props = { setPage: React.Dispatch<React.SetStateAction<Page>> }

export default function Home({ setPage }: Props) {
  const supportMode = typeof window !== "undefined" && window.location.search.includes("support=true")

  useEffect(() => {
    const scrollToContact = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
    if (supportMode || window.location.hash === "#contact") {
      window.setTimeout(scrollToContact, 200)
    }
  }, [supportMode])

  return (
    <div>
      <Navbar setPage={setPage} />
      <HeroSection setPage={setPage} />
      <KeyFeatures />
      <AboutSection />
      <ContactSection supportMode={supportMode} />
      <Footer />
    </div>
  )
}
