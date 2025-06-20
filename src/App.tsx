import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wrapper from "@/components/Wrapper.tsx";
import Signup from "@/components/Signup.tsx";
import Attendance from "@/Attendance.tsx";
import Profile from "@/Profile.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[var(--color-primary)]">
        <Routes>
          <Route
            path="/"
            element={
              <Login />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Wrapper>
                <Dashboard />
              </Wrapper>
            }
          />
          <Route
            path="/signup"
            element={
              <Signup />
            }
          />
          <Route
            path="/attendance"
            element={
              <Attendance />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
