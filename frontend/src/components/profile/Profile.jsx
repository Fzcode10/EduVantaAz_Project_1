import { useState, useEffect, useContext } from "react";
import { useProfile } from "../../hooks/useprofile";
import { ProfileItem } from "./subComponent/profileItem";
import { AuthContext } from "../../contextProvider/authContext";
import { User, LogOut, ShieldCheck, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { usePageTracker } from '../../hooks/usePageTracker';


export const Profile = () => {
  const { fetchProfileData, error, loading } = useProfile();
  const [profile, setProfile] = useState(null);
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { clearTrackingData } = usePageTracker();

  useEffect(() => {
    // If the authenticated user is Staff, avoid hitting the Student database endpoint mapped
    if (user && (user.role === 'admin' || user.role === 'mentor')) {
      setProfile({
        fullName: user.fullName,
        email: user.email,
        role: user.role
      });
      return; 
    }

    // Otherwise, rigorously fetch detailed mapped student profile dynamically from external REST logic efficiently
    const loadProfile = async () => {
      await fetchProfileData();
      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile.student);
      }
    };
    if (user && user.role === 'student') {
        loadProfile();
    }
  }, [user]);
  
  const handleLogout = async () => {
    await clearTrackingData();
    localStorage.removeItem('student');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

 const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
 };

  // const handleLogout = () => {
  //   // Optional: Clear localStorage here if your context doesn't handle it
  //   localStorage.removeItem("profile");
  //   localStorage.removeItem("student"); // clear student email and password also

  //   dispatch({ type: "LOGOUT" });
  // };

  if (loading && user?.role === 'student')
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );

  if (error && user?.role === 'student')
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
        <div className="bg-[var(--bg-surface)] text-red-500 p-4 rounded-xl border border-red-500/30 flex items-center gap-3">
          <ShieldCheck size={20} />
          <span>{error}</span>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-secondary)] font-medium">No profile found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="theme-panel overflow-hidden mb-6 border-none">
          <div className="h-32 bg-accent w-full relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-[var(--bg-surface)] rounded-2xl shadow-md flex items-center justify-center border-4 border-[var(--bg-primary)] text-accent transition-colors duration-300">
                <User size={48} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                {profile.fullName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-[var(--text-secondary)] text-sm">
                {user?.role === 'student' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={16} /> {profile.course}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} /> {profile.district}, {profile.state}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 capitalize font-semibold shadow-sm px-2 py-0.5 rounded-md bg-[var(--border-divider)] text-accent">
                    <Briefcase size={16} /> {profile.role}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-primary)] text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all border border-red-500/30 shadow-sm cursor-pointer"
            >
              <LogOut size={18} />
              Logout Account
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className={user?.role === 'student' ? "md:col-span-2 space-y-6" : "md:col-span-3 space-y-6"}>
            <div className="theme-panel p-8">
              <div className="flex items-center gap-2 mb-6 text-accent">
                <ShieldCheck size={20} />
                <h3 className="font-bold uppercase tracking-widest text-xs">
                  Identity Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileItem label="Email Address" value={profile.email} />
                {user?.role === 'student' && (
                  <>
                    <ProfileItem label="Phone Number" value={profile.phone} />
                    <ProfileItem label="Enrollment No" value={profile.enrollment} />
                    <ProfileItem label="Date of Birth" value={formatDate(profile.dob)} />
                    <ProfileItem label="Gender" value={profile.gender} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Academic & Location Sidebar - Students Only */}
          {user?.role === 'student' && (
            <div className="space-y-6">
              <div className="theme-panel p-8">
                <div className="flex items-center gap-2 mb-6 text-accent">
                  <GraduationCap size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">
                    Academic
                  </h3>
                </div>
                <div className="space-y-6">
                  <ProfileItem label="Course" value={profile.course} />
                  <ProfileItem label="Semester" value={profile.semester} />
                </div>
              </div>

              <div className="theme-panel p-8">
                <div className="flex items-center gap-2 mb-6 text-accent">
                  <MapPin size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">
                    Location
                  </h3>
                </div>
                <div className="space-y-6">
                  <ProfileItem label="Area" value={profile.area} />
                  <ProfileItem label="State" value={profile.state} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center mt-12 text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest opacity-70">
          {user?.role === 'student' ? "Academic Profile • Verified Student" : `Administrative Profile • Verified ${profile.role}`}
        </p>
      </div>
    </div>
  );
};
