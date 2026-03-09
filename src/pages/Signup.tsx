import { useState } from "react"

type Props = {
 setPage:(page:"home"|"login"|"signup"|"dashboard")=>void
}

export default function Signup({setPage}:Props){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const handleSignup = ()=>{

 if(!email || !password){
  alert("Fill all fields")
  return
 }

 const user = {email,password}

 localStorage.setItem("spa_user",JSON.stringify(user))

 alert("Account created successfully")

 setPage("login")
}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-50">

<div className="bg-white shadow-xl rounded-2xl p-10 w-96">

<button
 onClick={()=>setPage("home")}
 className="text-sm text-gray-500 mb-6"
>
← Back
</button>

<h2 className="text-2xl font-bold mb-6">
Create Account
</h2>

<input
 type="email"
 placeholder="Email"
 className="w-full border p-3 rounded-lg mb-4"
 onChange={(e)=>setEmail(e.target.value)}
/>

<input
 type="password"
 placeholder="Password"
 className="w-full border p-3 rounded-lg mb-6"
 onChange={(e)=>setPassword(e.target.value)}
/>

<button
 onClick={handleSignup}
 className="w-full bg-indigo-600 text-white py-3 rounded-xl"
>
Sign Up
</button>

<p className="text-sm text-gray-500 mt-4">
Already have account?
<span
 onClick={()=>setPage("login")}
 className="text-indigo-600 cursor-pointer ml-1"
>
Login
</span>
</p>

</div>

</div>

)
}