import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wrapper from "@/components/Wrapper.tsx";
import Signup from "@/pages/Signup.tsx";
import Attendance from "@/pages/Attendance.tsx";
import Profile from "@/pages/Profile.tsx";

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
              <Wrapper>
                <Attendance />
              </Wrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <Wrapper>
                <Profile />
              </Wrapper>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
