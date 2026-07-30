import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"

type Props = {
  setPage: (page: "home" | "login" | "signup" | "dashboard") => void
}

export default function HeroSection({ setPage }: Props) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 py-28"
    >
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
          className="absolute left-20 top-10 h-72 w-72 rounded-full bg-indigo-200 dark:bg-indigo-900/30 opacity-40 blur-3xl"
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
          className="absolute bottom-10 right-20 h-72 w-72 rounded-full bg-blue-200 dark:bg-blue-900/30 opacity-40 blur-3xl"
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
            <TrendingUp className="h-4 w-4" />
            Data-Driven Academic Insights
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-slate-100 dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
              Unlock Your Full
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              Academic Potential
            </span>
          </h1>

          <p className="mb-10 max-w-xl text-xl leading-relaxed text-gray-600 dark:text-slate-300">
            Track performance, analyze trends, and make smarter academic decisions
            with structured data insights.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setPage("signup")}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl"
            >
              Get Started
            </button>

            <button
              onClick={() => setPage("login")}
              className="rounded-xl border border-indigo-600 px-8 py-4 font-medium text-indigo-600 dark:text-indigo-300 dark:border-indigo-500 transition-all duration-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white"
            >
              Login
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 shadow-2xl"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "80%" }}
              transition={{ duration: 1 }}
              className="h-4 rounded-full bg-indigo-500"
            />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "70%" }}
              transition={{ duration: 1 }}
              className="h-4 rounded-full bg-purple-500"
            />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1 }}
              className="h-4 rounded-full bg-blue-500"
            />

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "65%" }}
              transition={{ duration: 1 }}
              className="h-4 rounded-full bg-green-500"
            />
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-slate-400">Semester Growth: +15%</div>
        </motion.div>
      </div>
    </section>
  )
}
