import Navbar from "./Navbar";
import Progress from "@/components/ui/Progress.tsx";
import {useEffect, useState} from "react";
import {supabase} from "@/supabase-client.ts";
import {Calendar} from "@/components/ui/Calender.tsx";

function Dashboard({ user }) {
  const [course, setCourse] = useState<any[]>()
  const [username, setUsername] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())

  console.log(user)
  console.log(date)

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
        const sortedCourses = data?.sort((a, b) => a.subject_code.localeCompare(b.subject_code))
        setCourse(sortedCourses)
      }
    }
    handleCourse()

    const changeListener = supabase
      .channel("course_updates")
      .on("postgres_changes",{
        event: "*",
        schema: "public",
        table: "courses",
      },
      (payload) => {
        console.log("Realtime payload received:", payload);
        handleCourse();
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(changeListener);
    };
  }, [user?.id])

  return(
    <div className="h-full sm:h-screen w-full relative bg-custom-bg px-6">
      <Navbar />
      <h1 className="text-3xl font-semibold">Hello, {username}</h1>
      <div className="flex flex-col md:flex-row gap-3.5 sm:gap-5">
        <div className="">
          <div className="flex flex-row flex-wrap gap-3.5 mt-3">
            {course ? (
              course.map((course) => {
                const total = course.present_days + course.absent_days;
                const percentage = total > 0 ? Math.floor((course.present_days / total) * 100) : 0;

                return (
                  <Progress
                    key={course.id}
                    subject_code={course.subject_code}
                    subject_name={course.subject_name}
                    value={percentage}
                  />
                );
              })
            ) : (
              <div className="w-full h-full flex justify-center items-center">Loading...</div>
            )}
          </div>
        </div>
        <div className="md:w-1/4 flex justify-center item-center md:items-end flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard