import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // shadcn input
import { Loader2 } from "lucide-react";
import { Plus, Trash2, PencilLine } from "lucide-react";
import { supabase } from "@/supabase-client";
import Navbar from "@/components/Navbar";

interface Course {
  id: string;
  name: string;
  code?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  courses: Course[];
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    courses: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newCourse, setNewCourse] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    name: string;
    code?: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setError(null);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session fetch error:", sessionError);
        setError("Failed to get session");
        setProfileLoading(false);
        return;
      }
      if (!session?.user) {
        setError("Not authenticated");
        setProfileLoading(false);
        return;
      }
      setUserId(session.user.id);
      // Fetch profile
      const { data: userProfile, error: profileError } = await supabase
        .from("profile")
        .select("first_name, last_name")
        .eq("user_id", session.user.id)
        .single();
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      // Fetch courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", session.user.id);
      if (coursesError) {
        console.error("Courses fetch error:", coursesError);
      }
      if (profileError || coursesError) {
        setError("Failed to fetch profile or courses");
      }
      setProfile({
        firstName: userProfile?.first_name || "",
        lastName: userProfile?.last_name || "",
        courses: (courses || []).map((c: any) => ({
          id: c.id,
          name: c.subject_name,
          code: c.course_code,
        })),
      });
      setProfileLoading(false);
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("profile")
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
        })
        .eq("user_id", userId);
      if (updateError) setError("Failed to update profile");
    } catch (error) {
      setError("Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.trim() || !userId) return;
    setIsLoading(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("courses")
      .insert({
        user_id: userId,
        subject_name: newCourse.trim(),
        course_code: newCourseCode.trim(),
      })
      .select()
      .single();
    if (!insertError && data) {
      setProfile((prev) => ({
        ...prev,
        courses: [
          ...prev.courses,
          { id: data.id, name: data.subject_name, code: data.course_code },
        ],
      }));
      setNewCourse("");
      setNewCourseCode("");
    } else if (insertError) {
      setError("Failed to add course");
    }
    setIsLoading(false);
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);
    if (!deleteError) {
      setProfile((prev) => ({
        ...prev,
        courses: prev.courses.filter((course) => course.id !== courseId),
      }));
    } else {
      setError("Failed to remove course");
    }
    setIsLoading(false);
  };

  const handleUpdateCourse = async (
    courseId: string,
    newName: string,
    newCode?: string
  ) => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("courses")
      .update({ subject_name: newName, course_code: newCode })
      .eq("id", courseId);
    if (updateError) {
      setError("Failed to update course");
      console.error("Update course error:", updateError);
    } else {
      setProfile((prev) => ({
        ...prev,
        courses: prev.courses.map((course) =>
          course.id === courseId
            ? { ...course, name: newName, code: newCode }
            : course
        ),
      }));
      setEditingCourse(null);
    }
    setIsLoading(false);
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 mb-2 animate-spin text-black" />
        <span className="text-gray-500">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-custom-bg px-4 sm:px-8 md:px-10 py-4">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="p-8 space-y-8 shadow-xl border border-border bg-white/90 rounded-2xl">
          <h1 className="text-3xl font-bold text-black mb-2">
            Profile Settings
          </h1>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="Enter your first name"
                  className="rounded-lg border-border focus:border-black focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Enter your last name"
                  className="rounded-lg border-border focus:border-black focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>
          </div>
          {/* Courses Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black">Courses</h2>
            {/* Add Course */}
            <div className="flex gap-2">
              <Input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="Enter course name"
                className="rounded-lg border-border focus:border-black focus:ring-2 focus:ring-black/20"
              />
              <Input
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="Enter course code"
                className="rounded-lg border-border focus:border-black focus:ring-2 focus:ring-black/20 w-32"
              />
              <Button
                onClick={handleAddCourse}
                className="flex items-center bg-black hover:bg-gray-900 text-white rounded-lg px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Course
              </Button>
            </div>
            {/* Course List */}
            <div className="space-y-2">
              {profile.courses.length === 0 && (
                <div className="text-gray-400 italic">
                  No courses added yet.
                </div>
              )}
              {profile.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border"
                >
                  {editingCourse?.id === course.id ? (
                    <div className="flex gap-2 w-full">
                      <Input
                        value={editingCourse.name}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            name: e.target.value,
                          })
                        }
                        placeholder="Course Name"
                        className="rounded-lg border-border focus:border-black focus:ring-2 focus:ring-black/20"
                      />
                      <Input
                        value={editingCourse.code || ""}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            code: e.target.value,
                          })
                        }
                        placeholder="Course Code"
                        className="rounded-lg border-border focus:border-black focus:ring-2 focus:ring-black/20 w-32"
                      />
                      <Button
                        onClick={() =>
                          handleUpdateCourse(
                            course.id,
                            editingCourse.name,
                            editingCourse.code
                          )
                        }
                        className="bg-black text-white px-3"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center w-full">
                      <span className="text-gray-800 font-medium w-1/2">
                        {course.name}
                      </span>
                      <span className="text-gray-600 w-1/4">
                        {course.code || ""}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingCourse({
                          id: course.id,
                          name: course.name,
                          code: course.code || "",
                        })
                      }
                      className="hover:bg-gray-200"
                    >
                      <PencilLine className="w-4 h-4 text-black" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCourse(course.id)}
                      className="hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleProfileUpdate}
              disabled={isLoading}
              className="min-w-[120px] bg-black hover:bg-gray-900 text-white rounded-lg px-4 py-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
