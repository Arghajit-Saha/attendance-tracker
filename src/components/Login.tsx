import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {type ChangeEvent, React, useState} from "react";
import { supabase } from "@/supabase-client.ts"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const {error: signInError} = await supabase.auth.signInWithPassword({email, password})
    if(signInError) {
      console.log("Error Signing In : ", signInError.message)
      return
    }
  }

  return (
    <div className="flex flex-row items-center h-screen text-black justify-center">
      <div className="bg-black flex-col items-center justify-center gap-3.5 h-full w-1/2 text-white p-12 hidden sm:flex">
        <div>
          <h1 className="text-3xl">Attendance Tracker</h1>
        </div>
        <div className="flex flex-col items-start justify-start gap-3.5 flex-wrap">
          <p>
            An intuitive and efficient app to manage, monitor, and analyze attendance data for students, teams, or employees. Designed for simplicity and speed, it ensures accurate record-keeping and easy access to attendance insights.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 sm:w-1/2">
        <div className="flex flex-col items-center sm:item-start justify-center gap-3.5 h-full w-full">
          <h1 className="text-3xl font-bold mb-2.5">Login</h1>
          <form className="flex flex-col items-center justify-center gap-3.5 mt-3" onSubmit={ handleSubmit }>
            <Input type="email" placeholder="Email" onChange={(e : ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/>
            <Input type="password" placeholder="Password" onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}/>
            <Button type="submit">Login</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
