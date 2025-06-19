import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type ChangeEvent, useState } from "react"
import { supabase } from "@/supabase-client.ts"
import { BackgroundBeams } from "@/components/ui/background-beams.tsx"

function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      console.log("Error Signing Up: ", signUpError.message)
      setErrorMsg(signUpError.message)
      return
    }

    setErrorMsg("")
    alert("Check your email to confirm your account!")
  }

  return (
    <div className="flex flex-row items-center h-screen text-black justify-center">
      <div className="bg-[#080402] relative flex-col items-center justify-center gap-3.5 h-full w-1/2 text-white p-12 hidden sm:flex">
        <BackgroundBeams />
        <div>
          <h1 className="text-2xl md:text-5xl font-extrabold">Attendance Tracker</h1>
        </div>
        <div className="flex flex-col items-start justify-start gap-3.5 flex-wrap">
          <p className="text-lg text-gray-400">
            An intuitive and efficient app to manage, monitor, and analyze attendance data for students, teams, or employees. Designed for simplicity and speed, it ensures accurate record-keeping and easy access to attendance insights.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 sm:w-1/2">
        <div className="flex flex-col items-center justify-center gap-3.5 h-full w-full">
          <h1 className="text-3xl font-bold mb-2.5">Sign Up</h1>
          <form className="flex flex-col items-center justify-center gap-3.5 mt-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <Button type="submit">Create Account</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
