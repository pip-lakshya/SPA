import { motion } from "motion/react"
import {
  BarChart3,
  Lightbulb,
  TrendingUp,
  Users,
  Target,
  Brain
} from "lucide-react"

const features = [
  {
    icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
    title: "Real-Time Analytics",
    desc: "Track academic performance with structured visual reports."
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-purple-600" />,
    title: "Personalized Insights",
    desc: "Receive focused suggestions based on your performance data."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-green-600" />,
    title: "Progress Tracking",
    desc: "Monitor semester growth and improvement trends."
  },
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    title: "Peer Comparison",
    desc: "Compare performance with classmates and batch averages."
  },
  {
    icon: <Target className="w-8 h-8 text-orange-600" />,
    title: "Goal Setting",
    desc: "Set academic targets and measure achievement progress."
  },
  {
    icon: <Brain className="w-8 h-8 text-pink-600" />,
    title: "Performance Prediction",
    desc: "Forecast upcoming results using historical trends."
  }
]

export default function KeyFeatures() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-gray-600 text-lg">
            A complete toolkit designed to improve academic performance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 
                         hover:shadow-xl hover:-translate-y-2 
                         transition-all duration-300 cursor-pointer"
            >
              <div className="mb-5">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  )
}