import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {supabase} from "@/supabase-client.ts";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "" },
    { name: "Attendance", href: "" },
  ]

  return (
    <nav className="sticky mb-2.5">
      <div className=" mx-auto flex justify-between items-center h-16">
        <div className="text-xl font-bold ">Attendance Tracker</div>
        <div className="hidden md:flex justify-around items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-700 hover:bg-custom-text font-medium">
              {link.name}
            </a>
          ))}
        </div>
        <div className="hidden md:flex">
          <Button className="ml-4" onClick={logout}>Logout</Button>
        </div>
        <div className="md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700 focus:outline-none">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden shadow-md border-t">
          <div className="flex flex-col space-y-4 px-4 py-4">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-gray-700 hover:text-blue-600 font-medium">
                {link.name}
              </a>
            ))}
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
