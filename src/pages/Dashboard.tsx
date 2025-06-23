import Navbar from "./Navbar.tsx";
import Progress from "@/components/Progress.tsx";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase-client.ts";
import { Calendar } from "@/components/Calender.tsx";
import ProgressSkeleton from "@/components/ProgressSkeleton.tsx";
import { useNavigate } from "react-router-dom";
import {Loader2} from "lucide-react";

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
        <Loader2 className="animate-spin h-8 w-8 text-black" />
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
    <div className="min-h-screen w-full bg-custom-bg px-4 sm:px-8 md:px-10">
      <Navbar />
      <div className="max-w-screen mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Hello, {username}</h1>
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-medium text-gray-800 mb-3">Course Progress</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
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
                    <div key={course.id} className="w-full">
                      <Progress
                        subject_code={course.subject_code}
                        subject_name={course.subject_name}
                        value={percentage}
                      />
                    </div>
                  );
                })
              ) : (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="w-full">
                    <ProgressSkeleton />
                  </div>
                ))
              )}
            </div>
            {course && course.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No courses found</div>
                <div className="text-gray-400 text-sm">Add some courses to track your attendance</div>
              </div>
            )}
          </div>
          <div className="w-full xl:w-100 flex flex-col">
            <div className="bg-white/90 rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Calendar</h2>
              <Calendar
                key={"dashboard"}
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg mb-6 bg-inherit w-full"
              />
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">
                  {date?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <div className="space-y-2">
                  {dayAttendance ? (
                    dayAttendance.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                        <div className="text-sm">No classes scheduled</div>
                      </div>
                    ) : (
                      dayAttendance.map((day) => (
                        <div
                          key={day.id}
                          className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-900 text-white shadow-sm"
                        >
                          <div>
                            <h1 className="font-bold text-sm">{day.subject_code}</h1>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold
                            ${day.status === "present"
                              ? "bg-green-700 text-white"
                              : "bg-red-700 text-white"}
                          `}
                          >
                            {day.status === "present" ? "Present" : "Absent"}
                          </span>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;