import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import KeyFeatures from "../components/KeyFeatures"
import AboutSection from "../components/AboutSection"
import ContactSection from "../components/ContactSection"
import Footer from "../components/Footer"

type Props = {
  setPage: (page: "home" | "login" | "signup" | "dashboard") => void
}

export default function Home({ setPage }: Props) {
  return (
    <div>
      <Navbar setPage={setPage} />
      <HeroSection setPage={setPage} />
      <KeyFeatures />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  )
}