import { useState, useContext } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import { ThemeContext } from '../../contextProvider/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';
import EduVantaAZ_logo from '../../assets/EduVantaAZ_logo.jpg';

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  
  const [formData, setFormData] = useState({ 
    fullName: '', password: '', phone: '', gender: 'male', dob: '', 
    enrollment: '', rollno: '', course: '', semester: '', state: '', district: '', area: 'urban' 
  });
  
  const { dispatch } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:2000/api/auth/send-otp', { email });
      setSuccessMsg('OTP sent to your email! (Please check your Spam folder too)');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.post('http://localhost:2000/api/auth/verify-otp', { email, otp });
      setRegistrationToken(res.data.registrationToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        email,
        registrationToken,
        ...formData,
        semester: Number(formData.semester)
      };
      
      const res = await axios.post('http://localhost:2000/api/auth/register', payload);
      localStorage.setItem('student', JSON.stringify(res.data));
      dispatch({ type: 'LOGIN', payload: res.data }); // Registration exclusively enforces student boundaries dynamically via backend arrays inherently.
      navigate('/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-12 relative w-full overflow-x-hidden">
      
      {/* Absolute Logo Header for Auth */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
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

      <div className={`theme-panel transition-all duration-500 p-8 sm:p-10 w-full z-10 ${step === 3 ? 'max-w-4xl' : 'max-w-md'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-wide">
                {step === 1 && "Create Account"}
                {step === 2 && "Verify Email"}
                {step === 3 && "Secure Profile"}
            </h2>
            <div className="flex justify-center items-center gap-2 mt-4 text-sm text-[var(--text-secondary)]">
                <span className={`px-2 py-1 rounded transition-colors ${step >= 1 ? 'bg-accent text-white font-semibold' : 'bg-[var(--border-divider)]'}`}>1. Email</span>
                <span className="opacity-50">→</span>
                <span className={`px-2 py-1 rounded transition-colors ${step >= 2 ? 'bg-accent text-white font-semibold' : 'bg-[var(--border-divider)]'}`}>2. OTP</span>
                <span className="opacity-50">→</span>
                <span className={`px-2 py-1 rounded transition-colors ${step === 3 ? 'bg-accent text-white font-semibold' : 'bg-[var(--border-divider)]'}`}>3. Details</span>
            </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 p-3 rounded-lg mb-6 text-center text-sm">{error}</div>}
        {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 p-3 rounded-lg mb-6 text-center text-sm">{successMsg}</div>}

        {/* STEP 1: Email */}
        {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">University Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="theme-input" 
                  placeholder="student@university.edu" 
                  required 
                />
            </div>
            <button type="submit" disabled={loading} className="theme-btn mt-6 text-lg">
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
            </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
            <p className="text-[var(--text-secondary)] text-sm text-center mb-6">We sent a 6-digit code to <strong className="text-[var(--text-primary)]">{email}</strong>.</p>
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Enter OTP Code</label>
                <input 
                  type="text" 
                  maxLength="6" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  className="theme-input text-center text-2xl tracking-[0.5em] font-mono" 
                  placeholder="------" 
                  required 
                />
            </div>
            <button type="submit" disabled={loading} className="theme-btn mt-6 text-lg">
                {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mt-4 underline underline-offset-4 decoration-[var(--border-divider)] hover:decoration-[var(--text-secondary)] transition-all cursor-pointer">
              Change Email
            </button>
            </form>
        )}

        {/* STEP 3: Details Input */}
        {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleDataChange} className="theme-input" placeholder="John Doe" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleDataChange} className="theme-input" placeholder="9876543210" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Secure Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleDataChange} className="theme-input" placeholder="••••••••" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleDataChange} className="theme-input" style={{colorScheme: theme}} required />
                    </div>

                    {/* Academic Info */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Enrollment Number</label>
                        <input type="text" name="enrollment" value={formData.enrollment} onChange={handleDataChange} className="theme-input" placeholder="ENR-XXXX" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">University Roll No</label>
                        <input type="text" name="rollno" value={formData.rollno} onChange={handleDataChange} className="theme-input" placeholder="R-8484" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Course Enrolled</label>
                        <input type="text" name="course" value={formData.course} onChange={handleDataChange} className="theme-input" placeholder="B.Tech Computer Science" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Semester</label>
                        <input type="number" name="semester" min="1" max="10" value={formData.semester} onChange={handleDataChange} className="theme-input" placeholder="3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleDataChange} className="theme-input appearance-none bg-[var(--bg-primary)]" required>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Location Info */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleDataChange} className="theme-input" placeholder="Gujarat" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">District</label>
                        <input type="text" name="district" value={formData.district} onChange={handleDataChange} className="theme-input" placeholder="Ahmedabad" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Residential Area</label>
                        <select name="area" value={formData.area} onChange={handleDataChange} className="theme-input appearance-none bg-[var(--bg-primary)]" required>
                            <option value="urban">Urban</option>
                            <option value="rural">Rural</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-[var(--border-divider)] pt-8 mt-4">
                    <button type="submit" disabled={loading} className="theme-btn text-lg">
                        {loading ? 'Finalizing Profile...' : 'Complete Registration'}
                    </button>
                </div>
            </form>
        )}

        {/* Global Footer */}
        {step < 3 && (
            <div className="mt-8 text-center text-[var(--text-secondary)] text-sm border-t border-[var(--border-divider)] pt-6">
            Already have an account? <Link to="/login" className="theme-link ml-1">Log in here</Link>
            </div>
        )}
      </div>
    </div>
  );
}
