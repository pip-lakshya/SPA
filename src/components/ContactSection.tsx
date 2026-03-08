import { useState } from "react"
import { motion } from "motion/react"
import { Mail, User, MessageSquare } from "lucide-react"

export default function ContactSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !message) {
      alert("Please fill all fields")
      return
    }

    console.log({ name, email, message })
    alert("Message sent successfully!")

    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <section
      id="contact"
      className="py-28 bg-gradient-to-br from-slate-100 via-white to-indigo-100/40"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto px-6"
      >
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Get In Touch
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm 
           rounded-3xl shadow-xl 
           border border-gray-200 
           p-10 space-y-6"
        >
          {/* Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50  border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                placeholder="Your Name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Write your message..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 
                       text-white font-medium shadow-md 
                       hover:shadow-xl hover:scale-[1.02] 
                       transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </motion.div>
    </section>
  )
}