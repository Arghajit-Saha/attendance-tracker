import Login from './components/Login'
import { useEffect, useState } from 'react'
import { supabase } from "@/supabase-client.ts"
import {Button} from "@/components/ui/button.tsx";

function App() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data);
  }

  const logout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
  }, [])
  return (
    <>
      {session ? (
        <Button onClick={ logout }>Logout</Button>
      ) : (
        <Login />
      )}
    </>
  )
}

export default App
