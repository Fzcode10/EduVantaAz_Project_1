import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contextProvider/authContext';
import axios from 'axios';

export default function TruthStopwatch({ onLogSaved }) {
  const { user } = useContext(AuthContext);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [focusedTime, setFocusedTime] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const stopTimer = () => {
    setIsActive(false);
    if (seconds > 0) {
      setShowModal(true);
    }
  };

  const handleSave = async () => {
    try {
      const durationMinutes = Math.max(Math.round(seconds / 60), 1);
      
      await axios.post('http://localhost:2000/api/tasks/stopwatch', 
        {
          task_name: "Focused Session",
          duration: durationMinutes,
          focused_time: Number(focusedTime) || durationMinutes
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      onLogSaved && onLogSaved();
      setShowModal(false);
      setSeconds(0);
      setFocusedTime(0);
    } catch (error) {
      alert("Failed to save run. Please try again.");
      console.error(error);
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="theme-panel p-10 text-center relative overflow-hidden flex flex-col items-center">
      
      {/* Pulse indicator when active */}
      {isActive && (
        <div className="absolute top-6 right-6 w-3 h-3 bg-accent rounded-full animate-ping"></div>
      )}
      
      <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Truth Stopwatch</h2>
      <p className="text-[var(--text-secondary)] mb-10 text-sm">Measure your raw focus without distractions.</p>

      <div className="text-7xl md:text-8xl font-mono text-[var(--text-primary)] font-semibold tracking-widest mb-12">
        {formatTime(seconds)}
      </div>

      <div className="flex justify-center gap-6 w-full max-w-sm">
        <button 
          onClick={toggleTimer}
          className={`px-8 py-4 rounded-xl font-bold text-white shadow-sm transition-all focus:ring-4 focus:ring-accent/30 w-full ${
            isActive 
              ? 'bg-[var(--text-primary)] hover:bg-[#333] dark:hover:bg-[#CCC] text-[var(--bg-primary)] dark:text-black'
              : 'theme-btn'
           }`}
        >
          {isActive ? 'Pause' : (seconds > 0 ? 'Resume' : 'Start Focus')}
        </button>
        
        <button 
          onClick={stopTimer}
          disabled={seconds === 0}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed w-full focus:ring-4 focus:ring-red-500/30 cursor-pointer"
        >
          Stop
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)}></div>
          
          <div className="theme-panel p-8 max-w-md w-full relative z-10 border-t-4 border-t-accent shadow-2xl transform transition-transform scale-100">
            <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">Honesty Prompt</h3>
            
            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
              You worked for <span className="font-bold text-accent">{Math.max(Math.round(seconds / 60), 1)}</span> minutes. 
              Be brutally honest—how much of that was high-focus work? (in minutes)
            </p>
            
            <input 
              type="number" 
              className="theme-input mb-8 text-center text-3xl pb-3 font-mono font-medium"
              value={focusedTime}
              onChange={(e) => setFocusedTime(e.target.value)}
              min="0"
              max={Math.max(Math.round(seconds / 60), 1)}
              placeholder="e.g. 25"
            />
            
            <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="w-full bg-[var(--bg-primary)] hover:bg-[var(--border-divider)] text-[var(--text-primary)] border border-[var(--border-divider)] font-semibold py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer">
                    Cancel
                </button>
                <button onClick={handleSave} className="theme-btn">
                    Log Session
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}