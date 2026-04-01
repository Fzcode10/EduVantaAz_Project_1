import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { Clock, UserCircle, LogIn, UserPlus, Moon, Sun } from "lucide-react";
import EduVantaAZ_logo from "../../assets/EduVantaAZ_logo.jpg";
import { AuthContext } from '../../contextProvider/authContext';
import { ThemeContext } from '../../contextProvider/ThemeContext';
import { usePageTracker } from '../../hooks/usePageTracker';
import TrackingModal from '../tracking/TrackingModal';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { totalActiveSeconds } = usePageTracker();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <nav className="w-full bg-[var(--bg-surface)] backdrop-blur-md sticky top-0 z-50 border-b border-[var(--border-divider)] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <NavLink to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <img
              src={EduVantaAZ_logo}
              alt="EduVantaAZ Logo"
              className="h-10 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)] hidden sm:block">
            EduVanta<span className="text-accent">AZ</span>
          </span>
        </NavLink>

        {/* Action Section */}
        <div className="flex items-center space-x-4 md:space-x-8">
          
          {/* Theme Toggle Button Globally Available */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-accent transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center space-x-6">
              {/* Animated Stopwatch Trigger Button */}
              <button 
                onClick={() => setIsTrackingModalOpen(true)}
                className="hidden md:flex items-center gap-2.5 bg-[var(--bg-primary)] hover:bg-[var(--border-divider)] text-[var(--text-primary)] px-4 py-2 rounded-xl border border-[var(--border-divider)] shadow-inner transition-colors duration-300 cursor-pointer"
              >
                <Clock size={16} className="text-accent animate-pulse" />
                <span className="font-mono font-bold text-sm tracking-tighter">{formatTime(totalActiveSeconds)}</span>
              </button>

              {/* User Profile Hook */}
              <NavLink to='/profile'>
              <div className="flex items-center gap-3 group cursor-pointer bg-[var(--bg-primary)] hover:bg-[var(--border-divider)] px-3 py-1.5 rounded-full border border-transparent transition-all shadow-sm">
                <UserCircle size={24} className="text-[var(--text-secondary)] group-hover:text-accent transition-colors" />
                <span className="hidden sm:block font-semibold text-[var(--text-primary)] group-hover:text-accent">
                  Profile
                </span>
              </div>
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Login Link */}
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--border-divider)] text-accent"
                      : "text-[var(--text-secondary)] hover:text-accent hover:bg-[var(--bg-primary)]"
                  }`
                }
              >
                <LogIn size={18} />
                <span>Login</span>
              </NavLink>

              {/* Signup Button (Primary Action) */}
              <NavLink
                to="/signup"
                className="theme-btn py-2.5 flex items-center gap-2 !w-auto"
              >
                <UserPlus size={18} />
                <span>Join Now</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <TrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} />
    </nav>
  );
};

export default Navbar;