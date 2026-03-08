type Page = "home" | "login" | "signup" | "dashboard"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

export default function Login({ setPage }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <button
          onClick={() => setPage("dashboard")}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Sign In
        </button>

        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <span
            className="text-indigo-600 cursor-pointer"
            onClick={() => setPage("signup")}
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  )
}