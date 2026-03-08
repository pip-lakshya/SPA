import { motion } from "motion/react"
import { BarChart3, Target, TrendingUp, ShieldCheck } from "lucide-react"

export default function AboutSection() {
  return (
  <section id="about" className="py-24 bg-white">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center"
  >
    <div>
      <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Empowering Students with Data
      </h2>

      <p className="text-gray-600 text-lg mb-6">
        Make smarter academic decisions using structured insights,
        performance tracking, and predictive analysis.
      </p>

      <div className="space-y-4">

        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" />
          <span className="text-gray-700">Performance Analytics</span>
        </div>

        <div className="flex items-center gap-3">
          <Target className="text-purple-600" />
          <span className="text-gray-700">Goal Tracking</span>
        </div>

        <div className="flex items-center gap-3">
          <TrendingUp className="text-green-600" />
          <span className="text-gray-700">Trend Monitoring</span>
        </div>

        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-600" />
          <span className="text-gray-700">Reliable Insights</span>
        </div>

      </div>
    </div>

    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-10 shadow-sm border">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        Why It Matters
      </h3>
      <p className="text-gray-600">
        Students often don't know where they are falling behind.
        This platform removes guesswork and provides clarity.
      </p>
    </div>

  </motion.div>
</section>)
}