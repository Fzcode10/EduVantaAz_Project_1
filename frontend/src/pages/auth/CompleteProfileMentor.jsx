import { useContext, useState } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';

export default function CompleteProfileMentor() {
  const { user, dispatch } = useContext(AuthContext);
  const [formData, setFormData] = useState({ phone: '', department: '', designation: '' });

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('/api/auth/complete-profile', formData, config);
      
      const updatedUser = { ...user, isRegistered: true };
      localStorage.setItem('student', JSON.stringify(updatedUser)); // Auth context relies on 'student' key generically in your implementation
      dispatch({ type: 'LOGIN', payload: updatedUser });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="theme-panel p-8 shadow-lg max-w-md w-full border-t-4 border-t-accent">
        <h2 className="text-2xl font-bold mb-6 text-center text-accent">Mentor Onboarding</h2>
        <form onSubmit={handleComplete} className="space-y-4">
          <div><label className="text-sm">Phone</label><input required className="theme-input w-full" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
          <div><label className="text-sm">Department</label><input required className="theme-input w-full" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} /></div>
          <div><label className="text-sm">Designation</label><input required className="theme-input w-full" value={formData.designation} onChange={e=>setFormData({...formData, designation: e.target.value})} /></div>
          <button type="submit" className="theme-btn w-full py-3 bg-accent text-white mt-4 font-bold rounded-xl shadow-lg shadow-accent/20">Finalize Profile</button>
        </form>
      </div>
    </div>
  );
}
