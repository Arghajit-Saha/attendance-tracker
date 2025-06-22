import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar.tsx";
import { Input } from "@/components/ui/input.tsx";
import { supabase } from "@/supabase-client.ts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Plus, Pencil, Trash2, Loader2, Save, Check } from "lucide-react";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [course, setCourse] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
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
        setUserProfile(null);
      } else {
        setUserProfile(profile);
        if (profile.first_name) setFirstName(profile.first_name);
        if (profile.last_name) setLastName(profile.last_name);
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const handleCourse = async () => {
      if (!userProfile?.user_id) return;
      setCourseLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", userProfile.user_id);
      if (!error && data) {
        const sorted = [];
        for (let i = 0; i < data.length; i++) {
          sorted.push(data[i]);
        }
        sorted.sort((a, b) => a.subject_code.localeCompare(b.subject_code));
        setCourse(sorted);
      }
      setCourseLoading(false);
    };
    handleCourse();
  }, [userProfile?.user_id]);

  const handleSubmit = async () => {
    if (!userProfile?.user_id) return;
    await supabase
      .from("profile")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("user_id", userProfile.user_id);
  };

  const handleAddCourse = async () => {
    if (!subjectCode || !subjectName || !userProfile?.user_id) return;
    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          subject_code: subjectCode,
          subject_name: subjectName,
          user_id: userProfile.user_id,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      const updated = [];
      for (let i = 0; i < course.length; i++) {
        updated.push(course[i]);
      }
      updated.push(data);
      updated.sort((a, b) => a.subject_code.localeCompare(b.subject_code));
      setCourse(updated);
      setSubjectCode("");
      setSubjectName("");
    }
  };

  const handleEditClick = (c: any) => {
    setEditingCourseId(c.id);
    setEditCode(c.subject_code);
    setEditName(c.subject_name);
  };

  const handleSaveCourse = async (id: number) => {
    const { error } = await supabase
      .from("courses")
      .update({ subject_code: editCode, subject_name: editName })
      .eq("id", id);
    if (!error) {
      const updated = [];
      for (let i = 0; i < course.length; i++) {
        if (course[i].id === id) {
          updated.push({
            id: id,
            user_id: course[i].user_id,
            subject_code: editCode,
            subject_name: editName,
          });
        } else {
          updated.push(course[i]);
        }
      }
      setCourse(updated);
      setEditingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-custom-bg px-4 sm:px-8 md:px-10">
      <Navbar />
      <div className="container mx-auto flex flex-col gap-4 p-4 sm:p-8 md:p-10 rounded-lg shadow-lg w-full max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <div>
            <h1 className="text-xl font-semibold mt-3">Personal Information</h1>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <Input className="w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <Input className="w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-semibold">Courses</h1>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Input
              placeholder="Enter Subject Code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
            <Input
              placeholder="Enter Subject Name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
            <Button onClick={handleAddCourse}>
              <Plus />
              Add Course
            </Button>
          </div>
          {courseLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="animate-spin h-8 w-8 text-black" />
            </div>
          ) : course && course.length > 0 ? (
            course.map((c) => (
              <div key={c.id} className="bg-black/90 text-white/90 p-3 rounded-lg flex flex-row items-center gap-4 justify-between mt-4 px-4">
                <div className="flex flex-col gap-1">
                  {editingCourseId === c.id ? (
                    <>
                      <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </>
                  ) : (
                    <>
                      <h1 className="text-lg font-semibold">{c.subject_code}</h1>
                      <h2 className="text-sm font-semibold">{c.subject_name}</h2>
                    </>
                  )}
                </div>
                <div className="flex flex-row gap-2">
                  {editingCourseId === c.id ? (
                    <Button onClick={() => handleSaveCourse(c.id)}><Check /></Button>
                  ) : (
                    <Button onClick={() => handleEditClick(c)}><Pencil /></Button>
                  )}
                  <Button className="hover:bg-red-200 text-red-500"><Trash2 /></Button>
                </div>
              </div>
            ))
          ) : (
            <div>No Courses :(</div>
          )}
        </div>
        <Button className="mt-4 bg-black/90" onClick={handleSubmit}>
          <Save />
          Save
        </Button>
      </div>
    </div>
  );
}

export default Profile;
