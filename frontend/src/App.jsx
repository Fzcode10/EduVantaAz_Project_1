import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { useContext } from "react";
import { AuthContext } from "./contextProvider/authContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Profile } from "./components/profile/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MarksEntry from "./pages/dashboard/MarksEntry";
import Unauthorized from "./pages/errors/Unauthorized";

import CompleteProfileStudent from "./pages/auth/CompleteProfileStudent";
import CompleteProfileMentor from "./pages/auth/CompleteProfileMentor";
import { CompleteProfileAdmin } from "./pages/auth/CompleteProfileAdmin";

// Global Layout wrapper injecting Navbar and Footer everywhere except isolated Auth screens
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const getDefaultDashboard = (user) => {
  if (!user) return "/login";
  if (!user.isRegistered) return `/register/complete/${user.role}`;
  return `/dashboard/${user.role}`;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Isolated Auth Routes (No Navbar/Footer) */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to={getDefaultDashboard(user)} />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to={getDefaultDashboard(user)} />}
        />
        <Route
          path="/signup"
          element={!user ? <Register /> : <Navigate to={getDefaultDashboard(user)} />}
        />

        <Route path="/register/complete/student" element={user && !user.isRegistered ? <CompleteProfileStudent /> : <Navigate to={getDefaultDashboard(user)} />} />
        <Route path="/register/complete/mentor"  element={user && !user.isRegistered ? <CompleteProfileMentor /> : <Navigate to={getDefaultDashboard(user)} />} />
        <Route path="/register/complete/admin"   element={user && !user.isRegistered ? <CompleteProfileAdmin /> : <Navigate to={getDefaultDashboard(user)} />} />

        {/* Global Application Routes (Wrapped in Navbar/Footer) */}
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                {user?.isRegistered ? <StudentDashboard /> : <Navigate to={`/register/complete/student`} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mentor"
            element={
              <ProtectedRoute allowedRoles={["mentor", "admin"]}>
                {user?.isRegistered ? <MentorDashboard /> : <Navigate to={`/register/complete/${user?.role}`} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mentor/marks/:subjectName"
            element={
              <ProtectedRoute allowedRoles={["mentor", "admin"]}>
                {user?.isRegistered ? <MarksEntry /> : <Navigate to={`/register/complete/${user?.role}`} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                {user?.isRegistered ? <AdminDashboard /> : <Navigate to={`/register/complete/admin`} />}
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />

          {/* Catch-all fallback intelligently resolves unknown paths to secure, authorized matching routes */}
          <Route
            path="*"
            element={<Navigate to={getDefaultDashboard(user)} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
