import { useState, useContext } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import { ThemeContext } from '../../contextProvider/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';
import EduVantaAZ_logo from '../../assets/EduVantaAZ_logo.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { dispatch } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      localStorage.setItem('student', JSON.stringify(res.data));
      dispatch({ type: 'LOGIN', payload: res.data });
      
      const role = res.data.role || 'student';
      if (role === 'admin') {
          navigate('/dashboard/admin');
      } else if (role === 'mentor') {
          navigate('/dashboard/mentor');
      } else {
          navigate('/dashboard/student');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-8 relative w-full">
      {/* Absolute Logo Header for Auth */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <img src={EduVantaAZ_logo} alt="EduVantaAZ Logo" className="h-10 w-10 object-contain rounded-lg shadow-md hover:scale-105 transition-transform" />
        <span className="text-xl font-bold bg-linear-to-r from-accent to-blue-500 bg-clip-text text-transparent hidden sm:block">EduVantaAZ</span>
      </div>

      {/* Theme Toggle Top Right */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--border-divider)] text-[var(--text-secondary)] hover:text-accent transition-all cursor-pointer"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="theme-panel w-full max-w-md p-8 sm:p-10 z-10">
        <h2 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)]">Welcome Back</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 p-3 rounded-lg mb-6 text-center text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="theme-input" 
              placeholder="student@example.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="theme-input" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="theme-btn mt-6 text-lg">Sign In</button>
        </form>
        
        <div className="mt-8 text-center text-[var(--text-secondary)] text-sm border-t border-[var(--border-divider)] pt-6">
          Don't have an account? <Link to="/register" className="theme-link ml-1">Register</Link>
        </div>
      </div>
    </div>
  );
}
