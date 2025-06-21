import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar.tsx";
import { Calendar } from "@/components/ui/Calender.tsx";
import { supabase } from "@/supabase-client.ts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, userProfile?.user_id]);

  const updateAttendance = async (
    subjectCode: string | null,
    status: string
  ) => {
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
  };

  if (loading || courseLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-2"></div>
      </div>
    );
  }

  return (
    <div className="h-full sm:h-screen w-full relative bg-custom-bg px-10">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <div className="w-1/3 h-1/3">
          <Calendar
            key={"dashboard"}
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg mb-4 bg-inherit"
          />
        </div>
        <div className="grow">
          <div className="space-y-4">
            {courses && courses.length > 0 ? (
              courses.map((course: Course) => {
                const subjectCode = course.subject_code;
                const subjectName = course.subject_name;
                const track = attendance?.find(
                  (item: AttendanceRecord) => item.subject_code === subjectCode
                );
                const status = track?.status ?? "none";

                return (
                  <div
                    key={subjectCode ?? ""}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black  border-2 text-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-lg font-semibold">{subjectCode}</div>
                      <div className="text-sm text-gray-200">{subjectName}</div>
                      <div className="px-3 py-1 rounded-full text-sm font-medium border text-black border-gray-300 bg-gray-100">
                        Status:{" "}
                        {status === "present" ? (
                          <span className="text-green-800 ml-1">Present</span>
                        ) : status === "absent" ? (
                          <span className="text-red-700 ml-1">Absent</span>
                        ) : (
                          <span className="text-gray-500 ml-1">None</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                      <Button
                        variant="default"
                        onClick={() => updateAttendance(subjectCode, "present")}
                        className="bg-green-700 hover:bg-green-900"
                      >
                        Mark Present
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => updateAttendance(subjectCode, "absent")}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        Mark Absent
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => updateAttendance(subjectCode, "")}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 italic">No Courses Found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
