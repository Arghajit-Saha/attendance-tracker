import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ChangeEvent, React, useEffect, useState } from "react";
import { supabase } from "@/supabase-client.ts";
import { BackgroundBeams } from "@/components/ui/background-beams.tsx";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email: email.trim(), password }
    );
    if (signInError) {
      console.log("Error Signing In : ", signInError.message);
      return;
    }

    if (data?.session) {
      navigate("/dashboard");
    } else {
      console.log("No Session returned");
    }
  };

  return (
    <div className="flex flex-row items-center h-screen text-black justify-center">
      <div className="bg-[#080402] relative flex-col items-center justify-center gap-3.5 h-full w-1/2 text-white p-12 hidden sm:flex">
        <BackgroundBeams />
        <div>
          <h1 className="text-2xl md:text-5xl font-extrabold">
            Attendance Tracker
          </h1>
        </div>
        <div className="flex flex-col items-start justify-start gap-3.5 flex-wrap">
          <p className="text-lg text-gray-400">
            An intuitive and efficient app to manage, monitor, and analyze
            attendance data for students, teams, or employees. Designed for
            simplicity and speed, it ensures accurate record-keeping and easy
            access to attendance insights.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 sm:w-1/2">
        <div className="flex flex-col items-center justify-center gap-3.5 h-full w-full">
          <h1 className="text-3xl font-bold mb-2.5">Login</h1>
          <form
            className="flex flex-col items-center justify-center gap-3.5 mt-3"
            onSubmit={handleSubmit}
          >
            <Input
              type="email"
              placeholder="Email"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <Input
              type="password"
              placeholder="Password"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
            <Button type="submit">Login</Button>
            <div>
              <p>Don’t have an account? <a href={"/signup"} className="font-bold underline">Sign up</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
