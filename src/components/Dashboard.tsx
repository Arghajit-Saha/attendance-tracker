import Navbar from "./Navbar";
import Progress from "@/components/ui/Progress.tsx";
import {useEffect, useState} from "react";
import {supabase} from "@/supabase-client.ts";

function Dashboard({ user }) {
  const [course, setCourse] = useState<any[]>()
  const [username, setUsername] = useState("")

  console.log(user)

  useEffect(() => {
    if(user?.first_name) {
      setUsername(user.first_name)
    }
  }, [user?.first_name]);

  useEffect(() => {
    const handleCourse = async() => {
      if(!user?.id) return;

      const {data, error} = await supabase
        .from('courses')
        .select("*")
        .eq('user_id', user.id)

      if (error) {
        console.error("Error fetching data:", error.message)
      } else {
        setCourse(data)
      }
    }
    handleCourse()
  }, [user?.id])

  return(
    <div className="h-screen w-full relative bg-custom-bg px-6">
      <Navbar />
      <h1 className="text-3xl font-semibold">Hello, {username}</h1>
      <div className="flex flex-row flex-wrap gap-3.5 mt-3">
        {course?.map((course) => (
          <Progress
            subject_code={course.subject_code}
            subject_name={course.subject_name}
            value={Math.floor(course.present_days / (course.present_days + course.absent_days) * 100)}
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard