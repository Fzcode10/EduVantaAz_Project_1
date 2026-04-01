import { useContext, useState } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';

export const CompleteProfileAdmin = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [formData, setFormData] = useState({ phone: '', department: '', designation: '' });

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:2000/api/auth/complete-profile', formData, config);
      
      const updatedUser = { ...user, isRegistered: true };
      localStorage.setItem('student', JSON.stringify(updatedUser));
      dispatch({ type: 'LOGIN', payload: updatedUser });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-500/5">
      <div className="theme-panel p-8 shadow-lg max-w-md w-full border-t-4 border-red-500">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Admin Initialization</h2>
        <form onSubmit={handleComplete} className="space-y-4">
          <div><label className="text-sm">Secure Line (Phone)</label><input required className="theme-input w-full" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
          <div><label className="text-sm">Directorate (Department)</label><input required className="theme-input w-full" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} /></div>
          <div><label className="text-sm">Clearance Level (Designation)</label><input required className="theme-input w-full" value={formData.designation} onChange={e=>setFormData({...formData, designation: e.target.value})} /></div>
          <button type="submit" className="theme-btn w-full py-3 bg-red-500 hover:bg-red-600 text-white mt-4 font-bold rounded-xl shadow-lg shadow-red-500/20">Initialize Admin Identity</button>
        </form>
      </div>
    </div>
  );
};
