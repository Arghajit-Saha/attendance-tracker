import Login from './components/Login'
import { useEffect, useState } from 'react'
import { supabase } from "@/supabase-client.ts"
import Dashboard from "./components/Dashboard"

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getSessionAndUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUserProfile(profile);
      }
    };

    getSessionAndUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('profile')
            .select("*")
            .eq('id', session.user.id)
            .single();

          if (!error) setUserProfile(data);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-[var(--color-primary)]">
      {session && userProfile ? (
        <Dashboard user={userProfile} />
      ) : (
        <Login />
      )}
    </div>
  )
}

export default App;
