import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';
import { 
  Shield, Database, UserPlus, BookCopy, 
  Activity, Server, HardDrive, Cpu,
  Search, Edit, Trash2, RefreshCw, Layers, Plus, Check, X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('identity'); // identity, system, database, ml

  // --- Edit Modal State ---
  const [editModal, setEditModal] = useState({ open: false, type: '', data: {} });

  // --- Data States ---
  const [subjectsList, setSubjectsList] = useState([]);
  const [mentorsList, setMentorsList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // --- Form States ---
  // 1. Staff Creation State
  const [staffData, setStaffData] = useState({ fullName: '', email: '', password: '', role: 'mentor', employeeId: '', assignedSubjects: [] });
  const [staffStatus, setStaffStatus] = useState({ error: '', success: '' });
  const [subjectData, setSubjectData] = useState({ subjectName: '', subjectId: '', courseName: '', semester: '', year: '', department: '' });
  const [assignData, setAssignData] = useState({ mentorId: '', subjectName: '', subjectId: '' });
  const [migrationData, setMigrationData] = useState({ subjectId: '' });

  // Status logs
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Fetches
  const fetchBaseData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [subs, mnters] = await Promise.all([
        axios.get('/api/admin/subjects', config),
        axios.get('/api/admin/mentors', config)
      ]);
      setSubjectsList(subs.data);
      setMentorsList(mnters.data);
    } catch (err) {
      console.error("Failed fetching base admin data");
    }
  };

  const fetchStaff = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/admin/staff', config);
      setStaffList(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async (filters = {}) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/admin/students?${query}`, config);
      setStudentsList(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchBaseData();
      fetchStaff();
      fetchStudents();
    }
  }, [user]);

  if (!user) return <div className="p-8 text-[var(--text-primary)]">Loading...</div>;

  const showStatus = (type, text) => {
      setStatusMsg({ type, text });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
  };

  // --- Action Handlers ---
  const handleCreateStaff = async (e) => {
      e.preventDefault();
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.post('/api/auth/create-staff', staffData, config);
          showStatus('success', res.data.msg);
          setStaffData({ fullName: '', email: '', password: '', role: 'mentor', employeeId: '', assignedSubjects: [] });
          fetchStaff();
          fetchBaseData();
      } catch (err) {
          showStatus('error', err.response?.data?.error || 'Generation Failed');
      }
  };

  const handleDeleteStaff = async (id) => {
    if(!window.confirm("Are you sure you want to permanently delete this staff member?")) return;
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.delete(`/api/admin/staff/${id}`, config);
        showStatus('success', res.data.msg);
        fetchStaff();
        fetchBaseData();
    } catch (err) { showStatus('error', err.response?.data?.error); }
  };

  // --- EDIT STAFF ---
  const openStaffEdit = (staff) => {
      setEditModal({
          open: true,
          type: 'staff',
          data: {
              id: staff.id,
              fullName: staff.fullName || '',
              email: staff.email || '',
              role: staff.role || 'mentor',
              employeeId: staff.employeeId || '',
              department: staff.department || '',
              designation: staff.designation || '',
              phone: staff.phone || ''
          }
      });
  };

  const handleEditStaff = async () => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { id, ...payload } = editModal.data;
          const res = await axios.put(`/api/admin/staff/${id}`, payload, config);
          showStatus('success', res.data.msg);
          setEditModal({ open: false, type: '', data: {} });
          fetchStaff();
          fetchBaseData();
      } catch (err) {
          showStatus('error', err.response?.data?.error || 'Staff update failed.');
      }
  };

  // --- EDIT STUDENT ---
  const openStudentEdit = (student) => {
      setEditModal({
          open: true,
          type: 'student',
          data: {
              id: student.id,
              enrollment: student.enrollment || '',
              semester: student.semester || ''
          }
      });
  };

  const handleEditStudent = async () => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { id, ...payload } = editModal.data;
          const res = await axios.put(`/api/admin/students/${id}`, payload, config);
          showStatus('success', res.data.msg);
          setEditModal({ open: false, type: '', data: {} });
          fetchStudents();
      } catch (err) {
          showStatus('error', err.response?.data?.error || 'Student update failed.');
      }
  };

  const handleCreateSubject = async (e) => {
      e.preventDefault();
      setStatusMsg({ type: 'success', text: 'Spinning up SQL Schema...' });
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.post('/api/admin/add-subject', subjectData, config);
          showStatus('success', res.data.msg);
          setSubjectData({ subjectName: '', subjectId: '', courseName: '', semester: '', year: '', department: '' });
          fetchBaseData();
      } catch (err) {
          showStatus('error', err.response?.data?.error || 'Failed to create subject');
      }
  };

  const handleAssignSubject = async (e) => {
      e.preventDefault();
      const selectedSubject = subjectsList.find(s => s.subjectId === assignData.subjectId);
      if(!selectedSubject) return showStatus('error', 'Please select a valid subject.');

      const payload = { ...assignData, subjectName: selectedSubject.subjectName };
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.post('/api/admin/assign-subject', payload, config);
          showStatus('success', res.data.msg);
          setAssignData({ mentorId: '', subjectName: '', subjectId: '' });
      } catch (err) {
          showStatus('error', err.response?.data?.error);
      }
  };

  const handleMigrateSemester = async (e) => {
      e.preventDefault();
      if(!window.confirm("WARNING: This will clone the marks table and wipe the active data for the new semester. Proceed?")) return;
      setStatusMsg({ type: 'success', text: 'Executing safe database migration protocols...' });
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.post('/api/admin/migrate-semester', migrationData, config);
          showStatus('success', res.data.msg);
          setMigrationData({ subjectId: '' });
      } catch (err) {
          showStatus('error', err.response?.data?.error || 'Migration Failed');
      }
  };

  // --- Render Helpers ---
  const renderIdentityTab = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
          {/* Identity Creation & Assignment Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleCreateStaff} className="theme-panel p-6 shadow-lg">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><UserPlus className="text-red-500"/> Assign Staff Identity</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><label className="text-xs">Full Name</label><input type="text" value={staffData.fullName} onChange={e=>setStaffData({...staffData, fullName: e.target.value})} className="theme-input" required /></div>
                      <div><label className="text-xs">Email</label><input type="email" value={staffData.email} onChange={e=>setStaffData({...staffData, email: e.target.value})} className="theme-input" required /></div>
                      <div><label className="text-xs">Employee ID</label><input type="text" value={staffData.employeeId} onChange={e=>setStaffData({...staffData, employeeId: e.target.value})} className="theme-input" required /></div>
                      <div><label className="text-xs">Initial Password</label><input type="password" value={staffData.password} onChange={e=>setStaffData({...staffData, password: e.target.value})} className="theme-input" required /></div>
                  </div>
                  <div className="mb-4"><label className="text-xs">Clearance Role</label><select value={staffData.role} onChange={e=>setStaffData({...staffData, role: e.target.value})} className="theme-input bg-[var(--bg-primary)]"><option value="mentor">Mentor Analyst</option><option value="admin">System Administrator</option></select></div>
                  
                  {staffData.role === 'mentor' && (
                      <div className="mb-6">
                          <label className="text-xs">Allocate Subjects (Hold Ctrl/Cmd to select multiple)</label>
                          <select multiple value={staffData.assignedSubjects.map(s => s.subjectId)} onChange={e => {
                              const opts = Array.from(e.target.selectedOptions);
                              const mapped = opts.map(opt => {
                                  const subj = subjectsList.find(s => s.subjectId === opt.value);
                                  return { subjectName: subj.subjectName, subjectId: subj.subjectId };
                              });
                              setStaffData({...staffData, assignedSubjects: mapped});
                          }} className="theme-input bg-[var(--bg-primary)] h-32">
                              {subjectsList.map(s => <option key={s.subjectId} value={s.subjectId}>{s.subjectName} [{s.subjectId}]</option>)}
                          </select>
                      </div>
                  )}

                  <button type="submit" className="theme-btn w-full bg-red-500 hover:bg-red-600 shadow-red-500/20">Provision Key</button>
              </form>

              <form onSubmit={handleAssignSubject} className="theme-panel p-6 shadow-lg">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><BookCopy className="text-blue-500"/> Assign Subject to Mentor</h2>
                  <div className="space-y-4">
                      <div><label className="text-xs">Mentor Target</label><select required value={assignData.mentorId} onChange={e=>setAssignData({...assignData, mentorId: e.target.value})} className="theme-input bg-[var(--bg-primary)]"><option value="" disabled>-- Select Mentor --</option>{mentorsList.map(m=><option key={m.id} value={m.id}>{m.fullName}</option>)}</select></div>
                      <div><label className="text-xs">Subject Target</label><select required value={assignData.subjectId} onChange={e=>setAssignData({...assignData, subjectId: e.target.value})} className="theme-input bg-[var(--bg-primary)]"><option value="" disabled>-- Select Subject --</option>{subjectsList.map(s=><option key={s.subjectId} value={s.subjectId}>{s.subjectName} [{s.subjectId}]</option>)}</select></div>
                      <button type="submit" className="theme-btn w-full bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 mt-4">Execute Assignment</button>
                  </div>
              </form>
          </div>

          {/* Directories Section */}
          <div className="theme-panel p-6 shadow-lg">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Search className="text-indigo-500"/> Staff Directory Array</h2>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                      <thead>
                          <tr className="border-b border-[var(--border-divider)] text-[var(--text-secondary)]">
                              <th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Assigned Subj</th><th className="p-3 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {staffList.map(s => (
                              <tr key={s.id} className="border-b border-[var(--border-divider)] hover:bg-[var(--bg-secondary)]">
                                  <td className="p-3 font-medium">{s.fullName} <span className="text-xs opacity-50">({s.employeeId})</span></td>
                                  <td className="p-3 uppercase text-xs">{s.role}</td>
                                  <td className="p-3 text-xs">{s.assignedSubjects?.length || 0} node(s)</td>
                                  <td className="p-3 text-right">
                                      <button onClick={() => openStaffEdit(s)} className="px-2 py-1 text-blue-500 hover:bg-blue-500/10 rounded mr-2" title="Edit Staff"><Edit size={16}/></button>
                                      <button onClick={() => handleDeleteStaff(s.id)} className="px-2 py-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="theme-panel p-6 shadow-lg">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Layers className="text-teal-500"/> Student Identity Filters</h2>
              {/* Filter Row */}
              <div className="flex gap-4 mb-4">
                  <input type="text" placeholder="Course Filter (e.g. B.Tech)" className="theme-input text-sm flex-1" onBlur={e => fetchStudents({ course: e.target.value })} />
                  <input type="number" placeholder="Semester" className="theme-input text-sm w-24" onBlur={e => fetchStudents({ semester: e.target.value })} />
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                      <thead>
                          <tr className="border-b border-[var(--border-divider)] text-[var(--text-secondary)]">
                              <th className="p-3">Enrollment</th><th className="p-3">Name</th><th className="p-3">Course</th><th className="p-3">Sem</th><th className="p-3 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {studentsList.map(st => (
                              <tr key={st.id} className="border-b border-[var(--border-divider)] hover:bg-[var(--bg-secondary)]">
                                  <td className="p-3 font-mono">{st.enrollment}</td><td className="p-3">{st.fullName}</td>
                                  <td className="p-3 text-xs">{st.course}</td><td className="p-3">{st.semester}</td>
                                  <td className="p-3 text-right">
                                      <button onClick={() => openStudentEdit(st)} className="px-2 py-1 text-teal-500 hover:bg-teal-500/10 rounded" title="Edit Student"><Edit size={16}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );

  const renderSystemTab = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="theme-panel p-6 flex flex-col items-center justify-center text-center shadow-lg border-t-4 border-indigo-500">
                  <Activity size={40} className="text-indigo-500 mb-3" />
                  <h3 className="text-lg font-bold">Traffic & Load</h3>
                  <p className="text-3xl font-mono mt-2 text-[var(--text-primary)]">142<span className="text-sm opacity-50">req/s</span></p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">Active Web Sockets UI Simulation</p>
              </div>
              <div className="theme-panel p-6 flex flex-col items-center justify-center text-center shadow-lg border-t-4 border-red-500">
                  <Server size={40} className="text-red-500 mb-3" />
                  <h3 className="text-lg font-bold">Error Tracking</h3>
                  <p className="text-3xl font-mono mt-2 text-red-500">3<span className="text-sm opacity-50">/hr</span></p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">Minor Auth Rejections</p>
              </div>
              <div className="theme-panel p-6 flex flex-col items-center justify-center text-center shadow-lg border-t-4 border-green-500">
                  <HardDrive size={40} className="text-green-500 mb-3" />
                  <h3 className="text-lg font-bold">Latency Dials</h3>
                  <p className="text-3xl font-mono mt-2 text-green-500">24<span className="text-sm opacity-50">ms</span></p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">Avg API Response Matrix</p>
              </div>
          </div>
          <div className="theme-panel p-6 h-64 flex items-center justify-center bg-[var(--bg-secondary)] border-none">
              <span className="text-[var(--text-secondary)]">[ Grafana/Datadog Mock Output Visualization Space ]</span>
          </div>
      </div>
  );

  const renderDatabaseTab = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <form onSubmit={handleCreateSubject} className="theme-panel p-8 shadow-lg">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><Database className="text-teal-500"/> Define Subject Schema</h2>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs">Subject Name</label><input type="text" value={subjectData.subjectName} onChange={e=>setSubjectData({...subjectData, subjectName: e.target.value})} className="theme-input" required /></div>
                      <div><label className="text-xs">Subject Code</label><input type="text" value={subjectData.subjectId} onChange={e=>setSubjectData({...subjectData, subjectId: e.target.value})} className="theme-input" required /></div>
                  </div>
                  <div><label className="text-xs">Course Name</label><input type="text" value={subjectData.courseName} onChange={e=>setSubjectData({...subjectData, courseName: e.target.value})} className="theme-input" placeholder="e.g. Computer Science" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs">Current Target Semester</label><input type="number" value={subjectData.semester} onChange={e=>setSubjectData({...subjectData, semester: e.target.value})} className="theme-input" required /></div>
                      <div><label className="text-xs">Academic Year</label><input type="text" value={subjectData.year} placeholder="2026-2027" onChange={e=>setSubjectData({...subjectData, year: e.target.value})} className="theme-input" required /></div>
                  </div>
                  <div><label className="text-xs">Department</label><input type="text" value={subjectData.department} onChange={e=>setSubjectData({...subjectData, department: e.target.value})} className="theme-input" required /></div>
                  <button type="submit" className="theme-btn w-full bg-teal-500 mt-4 shadow-teal-500/20">Instantiate SQL Table</button>
              </div>
          </form>

          <form onSubmit={handleMigrateSemester} className="theme-panel p-8 shadow-lg border-2 border-orange-500/30">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-orange-500"><RefreshCw className="text-orange-500"/> Sequence Semester Shift</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">This operation clones the target SQL Table, truncates the live rows, and increments the student MongoDB documents dynamically linking back to this Subject.</p>
              
              <div className="space-y-6">
                  <div>
                      <label className="font-bold text-sm block mb-2">Select Vector to Shift</label>
                      <select required value={migrationData.subjectId} onChange={e=>setMigrationData({subjectId: e.target.value})} className="theme-input py-3 text-lg bg-[var(--bg-primary)]">
                          <option value="" disabled>-- Target Subject ID --</option>
                          {subjectsList.map(s=><option key={s.subjectId} value={s.subjectId}>{s.subjectName} [Sem: {s.semester}]</option>)}
                      </select>
                  </div>
                  
                  <button type="submit" className="theme-btn text-lg w-full bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 py-4">Execute Table Truncation & Shift</button>
              </div>
          </form>
      </div>
  );

  const renderMLTab = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="theme-panel p-6 shadow-lg">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Cpu className="text-purple-500"/> Aggregation Node</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">Initialize the Federated Averaging (FedAvg) execution over the currently uploaded edge weights from Mentor nodes.</p>
                  <button onClick={() => showStatus('success', 'FedAvg Triggered: Global Model is converging...')} className="theme-btn w-full bg-purple-600 py-6 text-xl animate-pulse shadow-purple-600/30">Run FedAvg Aggregation</button>
              </div>

              <div className="theme-panel p-6 shadow-lg">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Plus className="text-pink-500"/> Parametric Feature Expansion</h2>
                  <div className="flex gap-4 items-end h-full mb-2">
                       <div className="flex-1"><label className="text-xs">New Tensor Parameter</label><input type="text" placeholder="e.g. Subjective Attendance Index" className="theme-input" /></div>
                       <button onClick={(e) => { e.preventDefault(); showStatus('success', 'Local schemas ordered to update nodes.'); }} className="theme-btn bg-pink-600 shadow-pink-600/20 h-[42px] px-6">Deploy Update</button>
                  </div>
              </div>
          </div>

          <div className="theme-panel p-6 shadow-lg">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">Edge Weight Submissions (Mock)</h2>
              <table className="w-full text-left font-mono text-sm">
                  <thead className="bg-[var(--bg-secondary)]"><tr className="text-[var(--text-secondary)]"><th className="p-3">Edge Node IP</th><th className="p-3">Loss</th><th className="p-3">Version Timestamp</th></tr></thead>
                  <tbody>
                      <tr className="border-b border-[var(--border-divider)]"><td className="p-3">10.0.12.5 (Mentor A)</td><td className="p-3 text-green-500">0.0412</td><td className="p-3">2026-03-30T10:14Z</td></tr>
                      <tr className="border-b border-[var(--border-divider)]"><td className="p-3">10.0.12.8 (Mentor B)</td><td className="p-3 text-green-500">0.0381</td><td className="p-3">2026-03-30T10:12Z</td></tr>
                      <tr><td className="p-3 text-[var(--text-secondary)]">10.0.14.2 (Mentor C)</td><td className="p-3 text-[var(--text-secondary)] opacity-50">Pending</td><td className="p-3 text-[var(--text-secondary)]">--</td></tr>
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
      <div className="min-h-screen max-w-[1400px] mx-auto p-4 md:p-8 relative">
          {/* Header */}
          <div className="theme-panel w-full p-6 mb-6 flex justify-between items-center border-l-4 border-l-accent shadow-md">
             <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3"><Shield className="text-accent" size={32} /> Omni-Admin Control</h1>
                <p className="mt-1 text-[var(--text-secondary)] text-sm">Clearance level {user?.role.toUpperCase()} • Server Connection Locked</p>
             </div>
          </div>

          {/* Floating Warning / Success Banner */}
          {statusMsg.text && (
              <div className={`fixed top-8 right-8 z-50 p-4 rounded-xl shadow-2xl transition-all flex items-center gap-3 animate-in slide-in-from-right-8 border ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                  {statusMsg.type === 'error' ? <X size={20}/> : <Check size={20}/>}
                  <span className="font-bold">{statusMsg.text}</span>
              </div>
          )}

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-divider)] shadow-sm">
              <button onClick={() => setActiveTab('identity')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'identity' ? 'bg-accent text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><UserPlus size={16}/> Base Identity Ops</button>
              <button onClick={() => setActiveTab('system')}   className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'system'   ? 'bg-indigo-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><Activity size={16}/> System Health</button>
              <button onClick={() => setActiveTab('database')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'database' ? 'bg-orange-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><Database size={16}/> Data Coordination</button>
              <button onClick={() => setActiveTab('ml')}       className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'ml'       ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><Cpu size={16}/> Edge Federation Array</button>
          </div>

          {/* Tab Content Renderer */}
          <div className="w-full">
              {activeTab === 'identity' && renderIdentityTab()}
              {activeTab === 'system' && renderSystemTab()}
              {activeTab === 'database' && renderDatabaseTab()}
              {activeTab === 'ml' && renderMLTab()}
          </div>

           {/* ═══════════ EDIT MODAL ═══════════ */}
           {editModal.open && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setEditModal({ open: false, type: '', data: {} })}>
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                   <div
                       className="relative bg-[var(--bg-surface)] border border-[var(--border-divider)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-in zoom-in-95 duration-300"
                       onClick={(e) => e.stopPropagation()}
                   >
                       <button
                           onClick={() => setEditModal({ open: false, type: '', data: {} })}
                           className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                       >
                           <X size={20} />
                       </button>

                       {editModal.type === 'staff' && (
                           <>
                               <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                   <Edit className="text-blue-500" size={20} /> Edit Staff Profile
                               </h2>
                               <div className="grid grid-cols-2 gap-4 mb-4">
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Full Name</label>
                                       <input type="text" value={editModal.data.fullName}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, fullName: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Email</label>
                                       <input type="email" value={editModal.data.email}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, email: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Employee ID</label>
                                       <input type="text" value={editModal.data.employeeId}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, employeeId: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Role</label>
                                       <select value={editModal.data.role}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, role: e.target.value } })}
                                           className="theme-input bg-[var(--bg-primary)]">
                                           <option value="mentor">Mentor</option>
                                           <option value="admin">Admin</option>
                                       </select>
                                   </div>
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Department</label>
                                       <input type="text" value={editModal.data.department}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, department: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Designation</label>
                                       <input type="text" value={editModal.data.designation}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, designation: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                                   <div className="col-span-2">
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Phone</label>
                                       <input type="text" value={editModal.data.phone}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, phone: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                               </div>
                               <button onClick={handleEditStaff}
                                   className="theme-btn w-full bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 mt-2">
                                   Save Changes
                               </button>
                           </>
                       )}

                       {editModal.type === 'student' && (
                           <>
                               <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                   <Edit className="text-teal-500" size={20} /> Edit Student Record
                               </h2>
                               <p className="text-xs text-[var(--text-secondary)] mb-6 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                   ⚠️ Changing the enrollment ID will automatically propagate to all linked MySQL marks tables.
                               </p>
                               <div className="space-y-4 mb-6">
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Enrollment ID</label>
                                       <input type="text" value={editModal.data.enrollment}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, enrollment: e.target.value } })}
                                           className="theme-input font-mono" />
                                   </div>
                                   <div>
                                       <label className="text-xs text-[var(--text-secondary)] block mb-1">Semester</label>
                                       <input type="number" value={editModal.data.semester}
                                           onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, semester: e.target.value } })}
                                           className="theme-input" />
                                   </div>
                               </div>
                               <button onClick={handleEditStudent}
                                   className="theme-btn w-full bg-teal-500 hover:bg-teal-600 shadow-teal-500/20">
                                   Update & Synchronize
                               </button>
                           </>
                       )}
                   </div>
               </div>
           )}
      </div>
  );
}
