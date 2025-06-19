import { useEffect, useState } from "react"
import { supabase } from "@/supabase-client.ts"

function Test() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: errorSession } = await supabase.auth.getSession()
      if (errorSession) {
        console.error("Error fetching session:", errorSession.message)
        setLoading(false)
        return
      }

      const userId = session?.user?.id

      const { data, error } = await supabase
        .from('courses')
        .select("*")
        .eq('user_id', userId)

      if (error) {
        console.error("Error fetching data:", error.message)
      } else {
        setData(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default Test
