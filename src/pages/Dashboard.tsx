import type { Page } from "../app/App"
import Navbar from "../components/Navbar"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

const semesterData = [
  { name: "Sem 1", score: 75 },
  { name: "Sem 2", score: 82 },
  { name: "Sem 3", score: 88 },
  { name: "Sem 4", score: 92 },
]

const domainData = [
  { name: "Science", score: 85 },
  { name: "Math", score: 78 },
  { name: "Humanities", score: 72 },
  { name: "Languages", score: 80 },
]

export default function Dashboard({ setPage }: Props) {

const loggedIn = localStorage.getItem("spa_loggedin")

if(!loggedIn){
setPage("login")
return null
}

return (

<div>

<Navbar setPage={setPage} />

<div className="min-h-screen bg-slate-50 p-8">

<div className="flex justify-between items-center mb-8">

<h1 className="text-3xl font-bold">
Student Performance Dashboard
</h1>

</div>

<div className="grid lg:grid-cols-2 gap-6">

<div className="bg-white p-6 rounded-2xl shadow-sm border">

<h2 className="text-lg font-bold mb-4">
Semester Performance
</h2>

<ResponsiveContainer width="100%" height={250}>
<AreaChart data={semesterData}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Area
type="monotone"
dataKey="score"
stroke="#3B82F6"
fill="#93C5FD"
strokeWidth={3}
/>
</AreaChart>
</ResponsiveContainer>

<div className="mt-4 flex gap-8 text-sm">
<p>Avg Grade: <span className="font-bold">85%</span></p>
<p>Attendance: <span className="font-bold text-green-600">92%</span></p>
</div>

</div>

<div className="bg-white p-6 rounded-2xl shadow-sm border">

<h2 className="text-lg font-bold mb-4">
Domain-Wise Scores
</h2>

<ResponsiveContainer width="100%" height={250}>
<BarChart data={domainData}>
<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="score" fill="#6366F1" radius={[8,8,0,0]}/>
</BarChart>
</ResponsiveContainer>

</div>

</div>

</div>

</div>

)

}