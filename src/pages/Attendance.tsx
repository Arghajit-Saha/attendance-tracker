import { useState, useEffect } from "react";
import Navbar from "@/pages/Navbar.tsx";
import { Calendar } from "@/components/Calender.tsx";
import { supabase } from "@/supabase-client.ts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/button.tsx";
import { Loader2, BookOpen, Calendar as CalendarIcon } from "lucide-react";

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  user_id: string;
};

type Course = {
  id: number;
  user_id: string;
  subject_code: string | null;
  subject_name: string | null;
  created_at: string;
};

type AttendanceRecord = {
  id: number;
  user_id: string;
  subject_code: string;
  date: string;
  status: "present" | "absent";
};

function Attendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [courses, setCourses] = useState<Course[] | null>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState<{ code: string | null; status: string | null} | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>();
  const [courseLoading, setCourseLoading] = useState(true);

  const onlyDate =
    date &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/");
        return;
      }
      const { data: profile, error: _error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (_error) {
        console.error("Error fetching profile:", _error.message);
        setUserProfile(null);
      } else {
        setUserProfile(profile);
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userProfile || !userProfile.user_id) return;

      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", userProfile.user_id);
      setCourses(data as Course[]);
      setCourseLoading(false);
    };
    fetchCourses();
  }, [userProfile?.user_id]);

  const fetchByDate = async () => {
    setAttendance(undefined);

    if (!onlyDate || !userProfile?.user_id) return;

    const { data, error: _error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userProfile.user_id)
      .eq("date", onlyDate);

    if (_error) {
      console.error("Error fetching attendance by date:", _error.message);
    } else {
      setAttendance(data as AttendanceRecord[]);
    }
  };

  useEffect(() => {
    fetchByDate();
  }, [date, userProfile?.user_id]);

  const updateAttendance = async (
    subjectCode: string | null,
    status: string
  ) => {
    setSubjectLoading({code: subjectCode, status: status});
    if (!onlyDate || !userProfile?.user_id) return;

    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("subject_code", subjectCode)
      .eq("date", onlyDate);

    if (status === "") {
      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
          .from("attendance")
          .delete()
          .eq("subject_code", subjectCode)
          .eq("date", onlyDate)
          .eq("user_id", userProfile.user_id);
        if (deleteError)
          console.error("Error deleting attendance:", deleteError.message);
      }
    } else if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from("attendance")
        .update({ status })
        .eq("subject_code", subjectCode)
        .eq("date", onlyDate)
        .eq("user_id", userProfile.user_id);
      if (updateError) console.error("Error while updating: ", updateError);
    } else {
      const { error: insertError } = await supabase.from("attendance").insert({
        subject_code: subjectCode,
        date: onlyDate,
        status: status,
        user_id: userProfile.user_id,
      });
      if (insertError) console.error("Error while inserting: ", insertError);
    }
    await fetchByDate();
    setSubjectLoading(null);
  };

  if (loading || courseLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-custom-bg px-4 sm:px-8 md:px-10">
      <Navbar />
      <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-between gap-5">
        <div className="">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">Mark Attendance</h1>
          <p className="text-gray-600">Select a date and mark attendance for your courses</p>
          <div className="w-full lg:w-120 mt-4">
            <div className="bg-white/90 rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4 pl-2.5">
                <CalendarIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-medium text-gray-800">Select Date</h2>
              </div>
              <Calendar
                key={"attendance"}
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg bg-inherit w-full"
              />
              {date && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Selected Date</div>
                  <div className="font-medium text-gray-800">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 grow">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-medium text-gray-800">Courses</h2>
              </div>
              {date && (
                <p className="text-sm text-gray-600">
                  Mark attendance for {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
            <div className="space-y-4">
              {courses && courses.length > 0 ? (
                courses.map((course: Course) => {
                  const subjectCode = course.subject_code;
                  const subjectName = course.subject_name;
                  const track = attendance?.find(
                    (item: AttendanceRecord) => item.subject_code === subjectCode
                  );
                  const status = track?.status ?? "none";
                  const isLoading = subjectLoading?.code === subjectCode;

                  return (
                    <div
                      key={subjectCode ?? ""}
                      className="bg-black rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Course Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                            <div className="text-lg font-semibold text-white">
                              {subjectCode}
                            </div>
                            <div className="text-gray-200 text-sm">
                              {subjectName}
                            </div>
                          </div>
                          <div className="inline-flex items-center">
                            <span className="text-sm text-gray-100 mr-2">Status:</span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border
                                ${status === "present"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : status === "absent"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"}
                              `}
                            >
                              {status === "present" ? "Present" : status === "absent" ? "Absent" : "Not Marked"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="default"
                            onClick={() => updateAttendance(subjectCode, "present")}
                            disabled={isLoading}
                            className={`bg-green-700 hover:bg-green-800 text-white min-w-[120px] 
                              ${status === "present" ? "ring-2 ring-green-600" : ""}`}
                          >
                            {isLoading && subjectLoading?.status === "present" ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Marking...
                              </>
                            ) : (
                              "Mark Present"
                            )}
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => updateAttendance(subjectCode, "absent")}
                            disabled={isLoading}
                            className={`bg-red-700 hover:bg-red-800 text-white min-w-[120px]
                              ${status === "absent" ? "ring-2 ring-red-600" : ""}`}
                          >
                            {isLoading && subjectLoading?.status === "absent" ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Marking...
                              </>
                            ) : (
                              "Mark Absent"
                            )}
                          </Button>
                          {status !== "none" && (
                            <Button
                              variant="outline"
                              onClick={() => updateAttendance(subjectCode, "")}
                              disabled={isLoading}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[80px]"
                            >
                              {isLoading && subjectLoading?.status === "" ? (
                                <>
                                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                  Clearing...
                                </>
                              ) : (
                                "Clear"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg mb-2">No courses found</div>
                  <div className="text-gray-400 text-sm">Add some courses to start marking attendance</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;