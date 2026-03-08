import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"

type Props = {
  setPage: (page: "home" | "login" | "signup" | "dashboard") => void
}

export default function HeroSection({ setPage }: Props) {
  return (
    <section
      id="home"
      className="relative py-28 bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
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
            <div className="h-4 bg-indigo-500 rounded-full w-4/5"></div>
            <div className="h-4 bg-purple-500 rounded-full w-3/4"></div>
            <div className="h-4 bg-blue-500 rounded-full w-full"></div>
            <div className="h-4 bg-green-500 rounded-full w-2/3"></div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            Semester Growth: +15%
          </div>
        </motion.div>

      </div>
    </section>
  )
}