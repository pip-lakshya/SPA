import { useState } from "react"
import type { Page } from "../app/App"

type Props = {
    setPage: React.Dispatch<React.SetStateAction<Page>>
}

export default function Login({ setPage }: Props) {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {

        // 🔴 validation
        if (!email || !password) {
            alert("Please fill all fields")
            return
        }

        try {

            setLoading(true)

            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (data.message === "Login successful") {
                localStorage.setItem("token", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))

                // 🔥 FIRST NAVIGATE
                setPage("dashboard")

            } else {
                alert(data.message)
            }

        } catch (err) {
            alert("Server error")
        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-50">

            <div className="bg-white shadow-xl p-10 rounded-2xl w-96">

                {/* Back */}
                <button
                    onClick={() => setPage("home")}
                    className="text-sm text-gray-500 mb-6 hover:text-gray-800"
                >
                    ← Back
                </button>

                <h2 className="text-2xl font-bold mb-6">
                    Login
                </h2>

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    className="border w-full p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="border w-full p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Button */}
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* Switch */}
                <p className="text-sm text-gray-500 mt-4 text-center">
                    No account?
                    <span
                        onClick={() => setPage("signup")}
                        className="text-indigo-600 cursor-pointer ml-1 hover:underline"
                    >
                        Signup
                    </span>
                </p>

            </div>

        </div>

    )
}