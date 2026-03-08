type Page = "home" | "login" | "signup" | "dashboard"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

export default function Signup({ setPage }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        <button
          onClick={() => setPage("dashboard")}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Create Account
        </button>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <span
            className="text-indigo-600 cursor-pointer"
            onClick={() => setPage("login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  )
}