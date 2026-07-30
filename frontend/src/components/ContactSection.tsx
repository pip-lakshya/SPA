import { useState } from "react"
import { motion } from "motion/react"
import { Mail, User, MessageSquare } from "lucide-react"

type Props = {
  supportMode?: boolean
}

export default function ContactSection({ supportMode = false }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [inquiryType, setInquiryType] = useState(supportMode ? "Support Request" : "General Inquiry")
  const [message, setMessage] = useState(supportMode ? "I need help with my account or the platform." : "")

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!name || !email || !message) {
    alert("Please fill all fields")
    return
  }

  try {

    await fetch(
      "https://script.google.com/macros/s/AKfycbwGCKGlosVYLY8JoYCwaKC5I1XG_S7JJS-HrvABzqmZt67RLa3T9KHUSS8v1xf-yhWXbw/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          inquiryType,
          message
        })
      }
    )

    alert("Message sent successfully!")

  } catch (error) {
    console.error(error)
    alert("Error sending message")
  }

  setName("")
  setEmail("")
  setInquiryType("General Inquiry")
  setMessage("")
}
  return (
    <section
      id="contact"
      className="py-28 bg-gradient-to-br from-slate-100 via-white to-indigo-100/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto px-6"
      >
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-slate-100 mb-12">
          Get In Touch
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm 
           rounded-3xl shadow-xl 
           border border-gray-200 dark:border-slate-800 dark:bg-slate-900/90
           p-10 space-y-6"
        >
          {/* Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400 dark:text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800"
                placeholder="Your Name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400 dark:text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Inquiry Type */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">
              Inquiry Type
            </label>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-800"
            >
              <option value="General Inquiry" className="dark:bg-slate-800 dark:text-slate-100">General Inquiry</option>
              <option value="Support Request" className="dark:bg-slate-800 dark:text-slate-100">Support Request</option>
              <option value="Feedback" className="dark:bg-slate-800 dark:text-slate-100">Feedback</option>
              <option value="Partnership" className="dark:bg-slate-800 dark:text-slate-100">Partnership</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">
              Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-slate-500 w-5 h-5" />
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800"
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


