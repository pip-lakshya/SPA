import { useState } from "react"
import type { Page } from "../app/App"

type Props = {
 setPage: React.Dispatch<React.SetStateAction<Page>>
}

export default function Login({ setPage }: Props){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const handleLogin = ()=>{

const storedUser = JSON.parse(localStorage.getItem("spa_user") || "null")

if(!storedUser){
alert("No account found")
return
}

if(storedUser.email === email && storedUser.password === password){

localStorage.setItem("spa_loggedin","true")

setPage("dashboard")

}else{

alert("Invalid credentials")

}

}

return(

<div className="min-h-screen flex items-center justify-center bg-slate-50">

<div className="bg-white shadow-xl p-10 rounded-2xl w-96">

<button
onClick={()=>setPage("home")}
className="text-sm text-gray-500 mb-6"
>
← Back
</button>

<h2 className="text-2xl font-bold mb-6">
Login
</h2>

<input
type="email"
placeholder="Email"
className="border w-full p-3 rounded-lg mb-4"
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
className="border w-full p-3 rounded-lg mb-6"
onChange={(e)=>setPassword(e.target.value)}
/>

<button
onClick={handleLogin}
className="w-full bg-indigo-600 text-white py-3 rounded-xl"
>
Login
</button>

<p className="text-sm text-gray-500 mt-4">
No account?
<span
onClick={()=>setPage("signup")}
className="text-indigo-600 cursor-pointer ml-1"
>
Signup
</span>
</p>

</div>

</div>

)

}