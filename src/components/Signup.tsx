import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/supabase-client"
import {useNavigate} from "react-router-dom";

function Signup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userId, setUserId] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [subjects, setSubjects] = useState([{ code: "", name: "" }])

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) return alert(error.message)
    setUserId(data?.user?.id || "")
    setStep(2)
  }

  const handleAddSubject = () => {
    setSubjects([...subjects, { code: "", name: "" }])
  }

  const handleSubjectChange = (index, key, value) => {
    const updated = [...subjects]
    updated[index][key] = value
    setSubjects(updated)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return

    const { error: profileError } = await supabase.from("profile").insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
    })

    if (profileError) {
      console.error("Profile insert failed:", profileError.message)
    }

    const subjectRows = subjects.map((s) => ({
      user_id: userId,
      subject_code: s.code,
      subject_name: s.name,
    }))

    await supabase.from("courses").insert(subjectRows)

    navigate("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      {step === 1 && (
        <form onSubmit={handleSignup} className="flex flex-col gap-4 w-full max-w-md">
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Continue</Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 w-full max-w-lg">
          <h2 className="text-2xl font-bold">Create Your Profile</h2>
          <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <h3 className="text-xl font-semibold mt-4">Subjects</h3>
          {subjects.map((subject, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Subject Code"
                value={subject.code}
                onChange={(e) => handleSubjectChange(idx, "code", e.target.value)}
              />
              <Input
                placeholder="Subject Name"
                value={subject.name}
                onChange={(e) => handleSubjectChange(idx, "name", e.target.value)}
              />
            </div>
          ))}

          <Button type="button" onClick={handleAddSubject}>+ Add Subject</Button>
          <Button type="submit">Finish</Button>
        </form>
      )}
    </div>
  )
}

export default Signup