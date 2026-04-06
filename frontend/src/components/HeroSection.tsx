import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

type Props = {
  setPage: (page: "home" | "login" | "signup" | "dashboard") => void
}

export default function HeroSection({ setPage }: Props) {
  const fullText = "Unlock Your Full Academic Potential"
  const [displayText, setDisplayText] = useState("")

  useEffect(() => {

    let index = 0

    const interval = setInterval(() => {

      setDisplayText(fullText.slice(0, index))
      index++

      if (index > fullText.length) {
        clearInterval(interval)
      }

    }, 60)

    return () => clearInterval(interval)

  }, [])
  return (
    <section
      id="home"
      className="relative py-28 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 overflow-hidden"
    >
      {/* Parallax Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">

        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 40 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute top-10 left-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-40"
        />

        <motion.div
          initial={{ y: 40 }}
          animate={{ y: -40 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40"
        />

      </div>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full mb-6 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Data-Driven Academic Insights
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent">
              Unlock Your Full
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Academic Potential
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-gray-600 text-xl leading-relaxed mb-10 max-w-xl">
            Track performance, analyze trends, and make smarter
            academic decisions with structured data insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setPage("signup")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 
                         text-white font-medium shadow-lg 
                         hover:shadow-2xl hover:scale-105 
                         transition-all duration-300"
            >
              Get Started
            </button>

            <button
              onClick={() => setPage("login")}
              className="px-8 py-4 rounded-xl border border-indigo-600 
                         text-indigo-600 font-medium 
                         hover:bg-indigo-600 hover:text-white 
                         transition-all duration-300"
            >
              Login
            </button>
          </div>
        </motion.div>

        {/* Right Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
        >
          <div className="space-y-6">

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "80%" }}
              transition={{ duration: 1 }}
              className="h-4 bg-indigo-500 rounded-full"
            />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "70%" }}
              transition={{ duration: 1 }}
              className="h-4 bg-purple-500 rounded-full"
            />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1 }}
              className="h-4 bg-blue-500 rounded-full"
            />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "65%" }}
              transition={{ duration: 1 }}
              className="h-4 bg-green-500 rounded-full"
            />

          </div>

          <div className="mt-8 text-sm text-gray-500">
            Semester Growth: +15%
          </div>
        </motion.div>

      </div>
    </section>
  )
}