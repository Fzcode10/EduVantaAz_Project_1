import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';
import { Save, ArrowLeft, PenTool, Database } from 'lucide-react';

export default function MarksEntry() {
  const { subjectName: subjectId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [marksState, setMarksState] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // 1. Fetch Students natively from MongoDB
        const stuRes = await axios.get('http://localhost:2000/api/mentor/students', config);
        setStudents(stuRes.data);
        
        // 2. Fetch Existing Marks structurally from MySQL
        const marksRes = await axios.get(`http://localhost:2000/api/mentor/marks/${subjectId}`, config);
        
        // 3. Map SQL array functionally into React State Matrix safely tied via Enrollment_Id validation natively
        const mapped = {};
        marksRes.data.forEach(row => {
          mapped[row.enrollment_id] = { marks: row.marks || '', remarks: row.remarks || '', grade: row.grade || '', attendance: row.attendance || '' };
        });
        setMarksState(mapped);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setStatus("System Error: Failed to build grade matrix bindings.");
        setLoading(false);
      }
    };
    loadData();
  }, [user, subjectId]);

  const handleInputChange = (enrollment_id, field, value) => {
    setMarksState(prev => ({
      ...prev,
      [enrollment_id]: {
        ...prev[enrollment_id],
        [field]: value
      }
    }));
  };

  const calculateGrade = (marks) => {
    if (marks === '' || isNaN(marks)) return '';
    const m = Number(marks);
    if (m >= 90) return 'A+';
    if (m >= 80) return 'A';
    if (m >= 70) return 'B';
    if (m >= 60) return 'C';
    if (m >= 50) return 'D';
    return 'F';
  };

  const handleSave = async () => {
    setStatus("Syncing matrix to SQL Cluster...");
    
    // Construct Payload cleanly binding the arrays accurately evaluating natively successfully isolated
    const marksData = students.map(stu => {
      const entry = marksState[stu.enrollment] || {};
      const calculatedGrade = entry.marks ? calculateGrade(entry.marks) : '';
      
      return {
        enrollment_id: stu.enrollment,
        rollno: stu.rollno,
        marks: entry.marks ? parseInt(entry.marks) : null,
        grade: calculatedGrade,
        attendance: entry.attendance ? parseInt(entry.attendance) : 0,
        remarks: entry.remarks || ''
      };
    });

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:2000/api/mentor/save-marks', {
        subject_id: subjectId,
        marksData
      }, config);
      setStatus("Marks securely committed to SQL Array!");
      setTimeout(() => setStatus(''), 4000);
    } catch (err) {
      setStatus(`Save Failed: ${err.response?.data?.error || err.message}`);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  if (loading) {
     return <div className="p-12 text-center text-[var(--text-secondary)]">Initializing Data Matrix...</div>;
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-6 md:p-12 relative transition-colors duration-300">
        <button onClick={() => navigate('/dashboard/mentor')} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-accent font-semibold transition-colors mb-6">
            <ArrowLeft size={20} /> Return to Mentor Control Center
        </button>
        
        <div className="theme-panel p-8 mb-8 border-t-4 border-t-accent shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-3">
                    <Database className="text-accent" /> {subjectId.replace(/_/g, ' ')}
                </h1>
                <p className="mt-2 text-[var(--text-secondary)]">Grading Grid initialized. Changes dynamically recalculate semantic Grades natively.</p>
            </div>
            
            <button onClick={handleSave} className="theme-btn px-6 py-3 bg-accent hover:bg-[var(--color-accent-hover-light)] dark:hover:bg-accent-hover font-bold flex items-center gap-2 shadow-lg shadow-accent/20">
                <Save size={20} /> Commit to Database
            </button>
        </div>

        {status && <div className="bg-accent/10 border border-accent/30 text-accent p-4 rounded-xl mb-6 font-bold text-center">{status}</div>}

        <div className="theme-panel overflow-hidden shadow-lg border border-[var(--border-divider)]">
            <div className="overflow-x-auto w-full max-w-[100vw]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-divider)] text-[var(--text-secondary)] text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Enrollment ID</th>
                            <th className="p-4 font-bold">Roll No</th>
                            <th className="p-4 font-bold">Student Name</th>
                            <th className="p-4 font-bold">Marks / 100</th>
                            <th className="p-4 font-bold">Grade</th>
                            <th className="p-4 font-bold">Attendance %</th>
                            <th className="p-4 font-bold">Comments (Remarks)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-divider)]">
                        {students.map((student) => {
                            const entry = marksState[student.enrollment] || {};
                            const curGrade = calculateGrade(entry.marks);

                            return (
                                <tr key={student.enrollment} className="hover:bg-[var(--bg-surface)] transition-colors">
                                    <td className="p-4 font-mono font-semibold text-[var(--text-primary)]">
                                        {student.enrollment}
                                    </td>
                                    <td className="p-4 font-mono font-semibold text-[var(--text-secondary)] bg-[var(--bg-primary)]">
                                        {student.rollno || 'N/A'}
                                    </td>
                                    <td className="p-4 text-[var(--text-primary)] font-medium">
                                        {student.fullName}
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            className="theme-input max-w-[100px] text-center font-bold text-accent"
                                            placeholder="--"
                                            min="0"
                                            max="100"
                                            value={entry.marks || ''}
                                            onChange={(e) => handleInputChange(student.enrollment, 'marks', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block w-10 text-center font-bold ${curGrade === 'F' ? 'text-red-500' : 'text-green-500'}`}>
                                            {curGrade || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            className="theme-input max-w-[80px] text-center font-bold text-blue-500"
                                            placeholder="--"
                                            min="0"
                                            max="100"
                                            value={entry.attendance || ''}
                                            onChange={(e) => handleInputChange(student.enrollment, 'attendance', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="text"
                                            className="theme-input min-w-[200px]"
                                            placeholder="Optional remarks..."
                                            value={entry.remarks || ''}
                                            onChange={(e) => handleInputChange(student.enrollment, 'remarks', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
