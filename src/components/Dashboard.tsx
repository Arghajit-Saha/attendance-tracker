import Navbar from "./Navbar";
import Progress from "@/components/ui/Progress.tsx";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase-client.ts";
import { Calendar } from "@/components/ui/Calender.tsx";
import ProgressSkeleton from "@/components/ui/ProgressSkeleton.tsx";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [course, setCourse] = useState<any[]>();
  const [username, setUsername] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<any[]>();
  const [dayAttendance, setDayAttendance] = useState<any[]>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/");
        return;
      }
      const { data: profile, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (error) {
        console.error("Error fetching profile:", error.message);
        setUserProfile(null);
      } else {
        setUserProfile(profile);
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (userProfile?.first_name) {
      setUsername(userProfile.first_name);
    }
  }, [userProfile?.first_name]);

  useEffect(() => {
    const handleCourse = async () => {
      if (!userProfile?.id) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", userProfile.user_id);

      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        const sortedCourses = data?.sort((a, b) =>
          a.subject_code.localeCompare(b.subject_code)
        );
        setCourse(sortedCourses);
      }
    };
    handleCourse();
  }, [userProfile?.user_id]);

  useEffect(() => {
    const handleAttendance = async () => {
      if (!userProfile?.user_id) return;
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userProfile.user_id);

      if (!error) {
        setAttendance(data);
      } else {
        console.error("Error fetching data:", error.message);
      }
    };

    handleAttendance();
  }, [userProfile?.user_id]);

  useEffect(() => {
    const fetchByDate = async () => {
      const onlyDate =
        date &&
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;

      setDayAttendance(undefined);

      if (!onlyDate || !userProfile?.user_id) return;

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userProfile.user_id)
        .eq("date", onlyDate);

      if (error) {
        console.error("Error fetching attendance by date:", error.message);
      } else {
        setDayAttendance(data);
      }
    };
    fetchByDate();
  }, [date, userProfile?.user_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-2"></div>
      </div>
    );
  }

  if (!userProfile) {
    const logout = async () => {
      await supabase.auth.signOut();
      navigate("/");
    };
    logout();
  }

  return (
    <div className="min-h-screen w-full bg-custom-bg px-4 sm:px-8 md:px-10 py-4">
      <Navbar />
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Hello, {username}</h1>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex-1 flex flex-wrap gap-4">
          {course ? (
            course.map((course) => {
              const track = attendance?.filter(
                (item) => item.subject_code === course.subject_code
              );
              const present_days =
                track?.filter((item) => item.status === "present")?.length || 0;
              const absent_days =
                track?.filter((item) => item.status === "absent")?.length || 0;
              const total = present_days + absent_days;
              const percentage = total > 0 ? Math.floor((present_days / total) * 100) : 0;
              return (
                <div className="flex-grow sm:flex-shrink-0 sm:basis-[48%] xl:basis-[30%] w-full min-w-[200px]">
                  <Progress
                    key={course.id}
                    subject_code={course.subject_code}
                    subject_name={course.subject_name}
                    value={percentage}
                  />
                </div>
              );
            })
          ) : (
            <>
              <ProgressSkeleton />
              <ProgressSkeleton />
              <ProgressSkeleton />
            </>
          )}
        </div>
        <div className="w-full lg:max-w-sm flex flex-col items-center">
          <Calendar
            key={"dashboard"}
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg mb-4 bg-inherit w-full max-w-xs"
          />
          <div className="w-full max-w-xs">
            {dayAttendance ? (
              dayAttendance.length === 0 ? (
                <div className="text-center text-gray-600">No Classes</div>
              ) : (
                dayAttendance.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center justify-between px-4 py-2 mb-2 rounded-lg bg-black text-white"
                  >
                    <h1 className="font-bold">{day.subject_code}</h1>
                    <span
                      className={`rounded px-3 py-1 text-sm font-medium
                      ${day.status === "present" ? "bg-green-800" : "bg-red-700"}
                    `}
                    >
                    {day.status === "present" ? "Present" : "Absent"}
                  </span>
                  </div>
                ))
              )
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );


}

export default Dashboard;
