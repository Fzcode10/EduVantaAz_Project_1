import { useContext, useState } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';

export default function CompleteProfileStudent() {
  const { user, dispatch } = useContext(AuthContext);
  const [complete, setComplete] = useState(false);

  const handleComplete = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:2000/api/auth/complete-profile', {}, config);
      
      const updatedUser = { ...user, isRegistered: true };
      localStorage.setItem('student', JSON.stringify(updatedUser));
      dispatch({ type: 'LOGIN', payload: updatedUser });
      setComplete(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="theme-panel p-8 shadow-lg max-w-md w-full text-center border-l-4 border-l-blue-500">
        <h2 className="text-2xl font-bold mb-4">Complete Profile</h2>
        <p className="text-[var(--text-secondary)] mb-6">Your student data has already been imported. Click below to verify and complete.</p>
        <button onClick={handleComplete} className="theme-btn w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg">Verify Profile</button>
      </div>
    </div>
  );
}
