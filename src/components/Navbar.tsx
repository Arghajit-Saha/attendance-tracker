import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {supabase} from "@/supabase-client.ts";
import {useNavigate, Link} from "react-router-dom";
import { UserRound } from 'lucide-react';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate();

  const logout = async () => {
    const {error} = await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Attendance", href: "/attendance" },
  ]

  return (
    <nav className="sticky mb-2.5">
      <div className=" mx-auto flex justify-between items-center h-16">
        <div className="text-xl font-bold ">Attendance Tracker</div>
        <div className="hidden md:flex justify-around items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="text-gray-700 hover:bg-custom-text font-medium hover:text-black">
              {link.name}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex md:items-center md:justify-between space-x-1 ">
          <Link to="/profile">
            <UserRound />
          </Link>
          <Button className="ml-4" onClick={logout}>Logout</Button>
        </div>
        <div className="md:hidden flex flex-row items-center justify-between gap-4">
          <UserRound />
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
