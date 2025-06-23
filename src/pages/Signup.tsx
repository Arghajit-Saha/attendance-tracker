import { useState } from "react";
import { Input } from "@/components/input.tsx";
import { Button } from "@/components/button.tsx";
import { supabase } from "@/supabase-client.ts";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [subjects, setSubjects] = useState([{ code: "", name: "" }]);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return alert(error.message);
    setUserId(data?.user?.id || "");
    setStep(2);
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { code: "", name: "" }]);
  };

  const handleSubjectChange = (index: number, key: string, value: string) => {
    const updated: Array<{ code: string; name: string }> = [...subjects];
    updated[index][key as "code" | "name"] = value;
    setSubjects(updated);
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    if (!firstName.trim() || !lastName.trim()) {
      alert("First Name and Last Name cannot be empty.");
      return;
    }

    const validSubjects = subjects.filter(
      (s) => s.code.trim() !== "" && s.name.trim() !== ""
    );
    if (validSubjects.length === 0) {
      alert("Please add at least one valid subject.");
      return;
    }

    const { error: profileError } = await supabase.from("profile").insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
    });

    if (profileError) {
      console.error("Profile insert failed:", profileError.message);
      alert("There was a problem creating your profile.");
      return;
    }

    const subjectRows = validSubjects.map((s) => ({
      user_id: userId,
      subject_code: s.code.trim(),
      subject_name: s.name.trim(),
    }));

    const { error: coursesError } = await supabase.from("courses").insert(subjectRows);

    if (coursesError) {
      console.error("Courses insert failed:", coursesError.message);
      alert("There was a problem adding your subjects.");
      return;
    }
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      {step === 1 && (
        <form
          onSubmit={handleSignup}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Continue</Button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleProfileSubmit}
          className="flex flex-col gap-4 w-full max-w-lg"
        >
          <h2 className="text-2xl font-bold">Create Your Profile</h2>
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <h3 className="text-xl font-semibold mt-4">Subjects</h3>
          {subjects.map((subject, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Subject Code"
                value={subject.code}
                onChange={(e) =>
                  handleSubjectChange(idx, "code", e.target.value)
                }
              />
              <Input
                placeholder="Subject Name"
                value={subject.name}
                onChange={(e) =>
                  handleSubjectChange(idx, "name", e.target.value)
                }
              />
            </div>
          ))}

          <Button type="button" onClick={handleAddSubject}>
            + Add Subject
          </Button>
          <Button type="submit">Finish</Button>
        </form>
      )}
    </div>
  );
}

export default Signup;
