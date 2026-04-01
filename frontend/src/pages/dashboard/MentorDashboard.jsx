import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  BookOpen, ArrowRight, Database, Target, Cpu, MessageSquare,
  Activity, CheckCircle, Clock, AlertTriangle, Upload, Play, Edit, Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MentorDashboard() {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, targets, ml, comms
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Data states
  const [analytics, setAnalytics] = useState([]);
  const [targets, setTargets] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Form states
  const [newTarget, setNewTarget] = useState({ studentId: '', title: '', description: '', targetMetric: 100, deadline: '' });
  
  // Drill-down Modal State
  const [drillDownStudent, setDrillDownStudent] = useState(null);

  // --- Core Fetches ---
  const fetchMySubjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:2000/api/mentor/my-subjects', config);
      setSubjects(res.data);
      if (res.data.length > 0) {
        setSelectedSubject(res.data[0].subjectId);
      }
    } catch { console.error("Failed to fetch subjects"); }
  };

  const fetchTabData = async () => {
    if (!selectedSubject) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Fetch relevant data based on active tab to save network
      if (activeTab === 'analytics') {
         const res = await axios.get(`http://localhost:2000/api/mentor/analytics/${selectedSubject}`, config);
         setAnalytics(res.data);
      } else if (activeTab === 'targets') {
         const res = await axios.get(`http://localhost:2000/api/mentor/targets/${selectedSubject}`, config);
         setTargets(res.data);
      } else if (activeTab === 'ml') {
         const res = await axios.get(`http://localhost:2000/api/mentor/recommendations/${selectedSubject}`, config);
         setRecommendations(res.data);
      } else if (activeTab === 'comms') {
         const res = await axios.get(`http://localhost:2000/api/mentor/tickets/${selectedSubject}`, config);
         setTickets(res.data);
      }
    } catch (err) { console.error("Tab fetch failed: ", err); }
  };

  useEffect(() => {
    if (user && user.token) fetchMySubjects();
  }, [user]);

  useEffect(() => {
    fetchTabData();
  }, [selectedSubject, activeTab]);

  const showStatus = (type, text) => {
      setStatusMsg({ type, text });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  // --- Handlers ---
  const handleAssignTarget = async (e) => {
    e.preventDefault();
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post('http://localhost:2000/api/mentor/targets', { ...newTarget, subjectId: selectedSubject }, config);
        showStatus('success', 'Goal Assigned to Student');
        setNewTarget({ studentId: '', title: '', description: '', targetMetric: 100, deadline: '' });
        fetchTabData();
    } catch (err) { showStatus('error', err.response?.data?.error); }
  };

  const verifyRec = async (id, status, text) => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`http://localhost:2000/api/mentor/recommendations/${id}/verify`, { status, refinedText: text }, config);
        showStatus('success', 'FL Node verified & Updated.');
        fetchTabData();
    } catch (err) { showStatus('error', err.response?.data?.error); }
  };

  const uploadAttendance = async (enrollmentId, pct) => {
    if (!pct || pct < 0 || pct > 100) return showStatus('error', 'Attendance must be 0-100.');
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post(`http://localhost:2000/api/mentor/attendance`, { subjectId: selectedSubject, enrollmentId, attendancePercentage: pct }, config);
        showStatus('success', 'Attendance updated in SQL.');
        fetchTabData();
    } catch (err) { showStatus('error', err.response?.data?.error); }
  };

  const resolveTicket = async (id, responseText) => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`http://localhost:2000/api/mentor/tickets/${id}`, { response: responseText }, config);
        showStatus('success', 'Doubt Ticket Closed.');
        fetchTabData();
    } catch (err) { showStatus('error', err.response?.data?.error); }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  // Render Helpers
  const renderAnalyticsTab = () => {
      const classAvg = analytics.length > 0 ? (analytics.reduce((acc, curr) => acc + (curr.marks || 0), 0) / analytics.length).toFixed(1) : 0;
      const topPerformers = analytics.filter(a => a.marks >= 80).length;
      const atRisk = analytics.filter(a => a.marks < 40).length;

      // Recharts Data Mapping
      const chartData = analytics.map(a => ({
         name: a.fullName.split(' ')[0], 
         Score: a.marks || 0
      })).slice(0, 15); // limit mapping for clean UI

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="theme-panel p-6 border-t-4 border-blue-500 flex flex-col items-center shadow-lg">
                    <Activity size={32} className="text-blue-500 mb-2"/>
                    <h3 className="font-bold">Class Average</h3>
                    <p className="text-4xl font-mono mt-2">{classAvg}</p>
                </div>
                <div className="theme-panel p-6 border-t-4 border-green-500 flex flex-col items-center shadow-lg">
                    <CheckCircle size={32} className="text-green-500 mb-2"/>
                    <h3 className="font-bold">Top Performers (&gt;80%)</h3>
                    <p className="text-4xl font-mono mt-2 text-green-500">{topPerformers}</p>
                </div>
                <div className="theme-panel p-6 border-t-4 border-red-500 flex flex-col items-center shadow-lg">
                    <AlertTriangle size={32} className="text-red-500 mb-2"/>
                    <h3 className="font-bold">Students at Risk (&lt;40%)</h3>
                    <p className="text-4xl font-mono mt-2 text-red-500">{atRisk}</p>
                </div>
            </div>

            {/* Subject-Wise Analytics Chart */}
            <div className="theme-panel p-6 shadow-lg h-[400px]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">SQL Score Distribution <span className="text-xs text-[var(--text-secondary)] font-normal ml-2">(Live from marks_{selectedSubject})</span></h2>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip cursor={{fill: 'var(--bg-secondary)'}} contentStyle={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-divider)'}} />
                        <Bar dataKey="Score" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Drill Down Students & Attendance Manager */}
            <div className="theme-panel p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Student Roster Drill-Down & Attendance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm text-[var(--text-primary)]">
                        <thead><tr className="border-b text-[var(--text-secondary)]"><th className="p-3">Enrollment</th><th className="p-3">Name</th><th className="p-3">SQL Mark</th><th className="p-3 w-40">Attendance %</th><th className="p-3 text-center">Profiles</th></tr></thead>
                        <tbody>
                            {analytics.map(st => (
                                <tr key={st.enrollment_id} className="border-b border-[var(--border-divider)] hover:bg-[var(--bg-secondary)] transition-colors">
                                    <td className="p-3 font-mono cursor-pointer" onClick={() => setDrillDownStudent(st)}>{st.enrollment_id}</td>
                                    <td className="p-3 font-semibold cursor-pointer" onClick={() => setDrillDownStudent(st)}>{st.fullName}</td>
                                    <td className="p-3 cursor-pointer" onClick={() => setDrillDownStudent(st)}>{st.marks || 0}</td>
                                    <td className="p-3">
                                       <div className="flex items-center gap-2">
                                           <input 
                                              type="number" 
                                              defaultValue={st.attendancePct} 
                                              onBlur={(e) => uploadAttendance(st.enrollment_id, Number(e.target.value))}
                                              className="w-16 theme-input py-1 px-2 text-center h-8" 
                                           />
                                           <span className="text-xs opacity-50">%</span>
                                       </div>
                                    </td>
                                    <td className="p-3 text-center"><button onClick={() => setDrillDownStudent(st)} className="text-accent underline text-xs">View Matrix</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Simple Inline Link inside Tab to Enter Marks */}
            <Link to={`/dashboard/mentor/marks/${selectedSubject}`} className="theme-btn w-full block text-center py-4 text-lg bg-accent/10 border border-accent text-accent hover:bg-accent hover:text-white transition-all">Direct Link: Edit SQL Marks Form</Link>
        </div>
      );
  };

  const renderTargetsTab = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <form onSubmit={handleAssignTarget} className="theme-panel p-6 shadow-lg h-fit lg:col-span-1">
              <h2 className="text-xl font-bold mb-6 flex gap-2 items-center"><Target className="text-accent"/> Goal Setting</h2>
              <div className="space-y-4">
                  <div>
                      <label className="text-xs">Select Target Student</label>
                      <select required value={newTarget.studentId} onChange={e=>setNewTarget({...newTarget, studentId: e.target.value})} className="theme-input bg-[var(--bg-primary)]">
                          <option value="">-- Global Audience List --</option>
                          {/* We mock this by stealing the analytics array for IDs. 
                              In prod, it should fetch raw students from GET /students strictly maped by subject course. */}
                          {analytics.map(a => <option key={a.enrollment_id} value={a.enrollment_id}>{a.fullName} - {a.enrollment_id}</option>)}
                      </select>
                  </div>
                  <div><label className="text-xs">Metric Title</label><input type="text" required value={newTarget.title} onChange={e=>setNewTarget({...newTarget, title: e.target.value})} className="theme-input" placeholder="e.g. Solve 50 Trees" /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs">Out of (Max)</label><input type="number" required value={newTarget.targetMetric} onChange={e=>setNewTarget({...newTarget, targetMetric: e.target.value})} className="theme-input" /></div>
                      <div><label className="text-xs">Deadline</label><input type="date" required value={newTarget.deadline} onChange={e=>setNewTarget({...newTarget, deadline: e.target.value})} className="theme-input" /></div>
                  </div>
                  <button type="submit" className="theme-btn w-full shadow-lg bg-accent shadow-accent/20">Dispatch Goal Node</button>
              </div>
          </form>

          <div className="theme-panel p-6 shadow-lg lg:col-span-2">
              <h2 className="text-xl font-bold mb-6">Active Progress Tracking</h2>
              {targets.length === 0 ? <p className="text-center text-[var(--text-secondary)] py-8">No active goals found for this Subject Vector.</p> : (
                  <div className="space-y-6">
                      {targets.map(t => {
                          const isOverdue = new Date(t.deadline) < new Date() && t.status !== 'completed';
                          const pct = Math.min((t.currentProgress / t.targetMetric) * 100, 100);
                          return (
                              <div key={t._id} className={`p-4 border rounded-xl ${isOverdue ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--border-divider)] bg-[var(--bg-secondary)]'}`}>
                                  <div className="flex justify-between mb-2">
                                      <h4 className="font-bold flex items-center gap-2">{t.title} {isOverdue && <Clock size={14} className="text-red-500"/>}</h4>
                                      <span className="text-sm font-mono">{t.currentProgress} / {t.targetMetric}</span>
                                  </div>
                                  <p className="text-xs text-[var(--text-secondary)] mb-3">Student Target: {t.studentId?.fullName || t.studentId}</p>
                                  {/* Tailwind Visual Progress Bar */}
                                  <div className="w-full bg-[var(--bg-primary)] rounded-full h-2.5 overflow-hidden">
                                      <div className={`h-2.5 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }}></div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )}
          </div>
      </div>
  );

  const renderMLTab = () => (
      <div className="space-y-6 animate-in fade-in duration-500">
          <div className="theme-panel p-8 text-center bg-purple-600 border-none text-white shadow-lg shadow-purple-600/20">
              <Cpu size={48} className="mx-auto mb-4 opacity-80 animate-pulse"/>
              <h2 className="text-2xl font-bold">EduVantaAZ Deep Federated Averaging</h2>
              <p className="text-white/80 mt-2 max-w-xl mx-auto">This UI connects natively with your backend `Recommendation` Mongoose array. (Python Flask integration pending for Phase ∞)</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
              {recommendations.length === 0 ? (
                  <div className="theme-panel p-6 text-center text-[var(--text-secondary)] border-dashed border-2">
                      No inbound predictions emitted from the edge cluster at this time.
                      <button onClick={async () => {
                           // Mock injection for UI purposes
                           const c = { headers: { Authorization: `Bearer ${user.token}` } };
                           await axios.post('http://localhost:2000/api/mentor/simulate-fl', { subjectId: selectedSubject }, c).catch(() => showStatus('success', 'Fallback Mock: Imagine a prediction arrived. (Endpoint missing but state alive)'));
                      }} className="block mx-auto mt-4 underline text-purple-500 italic">Simulate Mock Packet (Dev)</button>
                  </div>
              ) : recommendations.map(r => (
                  <div key={r._id} className="theme-panel p-6 shadow-md border-l-4 border-l-purple-500 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="flex-1">
                          <p className="text-xs text-purple-500 font-bold mb-1 tracking-wider">RECEIVED FEDERATED PREDICTION</p>
                          <h4 className="text-lg font-bold">{r.studentId?.fullName || "Student Node"}</h4>
                          <p className="mt-2 text-sm italic border-l-2 border-[var(--border-divider)] pl-4">"{r.refinedText || r.predictionText}"</p>
                          {r.feedbackGiven && <span className="inline-block mt-3 px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded-full uppercase font-bold tracking-widest"><Check size={12} className="inline mr-1"/> Validated by Logic</span>}
                      </div>

                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                          <button onClick={() => verifyRec(r._id, 'refined', prompt("Enter refined text block:", r.predictionText))} className="theme-btn bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-divider)] border border-[var(--border-divider)]"><Edit size={16} className="inline mr-1"/> Refine Model</button>
                          <button onClick={() => verifyRec(r._id, 'approved', r.predictionText)} className="theme-btn bg-purple-600 shadow-purple-600/20 hover:bg-purple-700 shadow-md">Approve Node</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderCommsTab = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="theme-panel p-6 shadow-lg h-fit">
              <h2 className="text-xl font-bold mb-6 flex gap-2 items-center"><Upload className="text-teal-500"/> Subject Materials</h2>
              <div className="border-2 border-dashed border-[var(--border-divider)] rounded-xl p-8 text-center bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto mb-3 text-[var(--text-secondary)]" />
                  <p className="font-bold text-[var(--text-primary)]">Drag & Drop Documents</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, PPTX, or MP4 supported</p>
                  <button onClick={() => showStatus('success', 'File Upload UI securely triggered. Storage Bucket logic required.')} className="theme-btn py-2 px-6 mt-4 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-divider)]">Select Local Node</button>
              </div>
              
              <div className="mt-6 space-y-3">
                  <h3 className="font-bold text-sm border-b pb-2">Active Syllabus Repositories</h3>
                  <p className="text-xs text-[var(--text-secondary)] italic text-center py-4">No payload repositories exist at the target index.</p>
              </div>
          </div>

          <div className="theme-panel p-6 shadow-lg h-[600px] flex flex-col">
              <h2 className="text-xl font-bold mb-6 flex gap-2 items-center"><MessageSquare className="text-orange-500"/> Doubt Resolution Net</h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {tickets.length === 0 ? <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm italic">Comm link idle. Open matrix.</div> : tickets.map(t => (
                      <div key={t._id} className="p-4 bg-[var(--bg-surface)] border border-[var(--border-divider)] rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-orange-500">{t.studentId?.fullName}</span>
                             <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${t.status==='resolved'?'bg-green-500/20 text-green-500':'bg-orange-500/20 text-orange-500'}`}>{t.status}</span>
                          </div>
                          <p className="text-sm border-l-2 border-[var(--border-divider)] pl-3 mb-3">{t.query}</p>
                          
                          {t.status === 'open' ? (
                              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border-divider)]">
                                  <input type="text" id={`res_${t._id}`} placeholder="Write a resolution response..." className="theme-input text-xs flex-1" />
                                  <button onClick={() => resolveTicket(t._id, document.getElementById(`res_${t._id}`).value)} className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600">Resolve</button>
                              </div>
                          ) : (
                              <div className="bg-[var(--bg-primary)] p-2 rounded text-xs text-[var(--text-secondary)] font-mono">
                                  <span className="font-bold text-accent">MENTOR:</span> {t.response}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-4 md:py-8 relative">
       {/* Global Subject Banner */}
       <div className="theme-panel w-full p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-accent text-white border-none shadow-lg shadow-accent/20">
           <div>
               <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Database /> Mentor Workspace Sync</h1>
               <p className="mt-1 text-white/80 text-sm">{user?.fullName} (Permissions Enabled)</p>
           </div>
           
           <div className="bg-white/10 p-3 rounded-lg border border-white/20 flex items-center gap-3 backdrop-blur-sm">
               <span className="text-xs font-bold uppercase tracking-wider text-white/70">Master Vector:</span>
               <select 
                   value={selectedSubject} 
                   onChange={(e) => setSelectedSubject(e.target.value)}
                   className="py-2 px-3 rounded bg-white text-accent font-bold outline-none cursor-pointer border-none"
               >
                   {subjects.length === 0 && <option disabled>Network Empty</option>}
                   {subjects.map(s => <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>)}
               </select>
           </div>
       </div>

       {/* Floating Notification */}
       {statusMsg.text && (
            <div className={`fixed top-8 right-8 z-50 p-4 rounded-xl shadow-2xl transition-all flex items-center gap-3 animate-in slide-in-from-right-8 border ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                {statusMsg.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
                <span className="font-bold">{statusMsg.text}</span>
            </div>
       )}

       {/* Module Navigation Tabs */}
       {subjects.length > 0 && (
           <div className="flex flex-wrap gap-2 mb-8 bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-divider)] shadow-sm">
               <button onClick={() => setActiveTab('analytics')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><Activity size={16}/> View DB Analytics</button>
               <button onClick={() => setActiveTab('targets')}   className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'targets'   ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><Target size={16}/> Vector Targets</button>
               <button onClick={() => setActiveTab('ml')}        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'ml'        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><Cpu size={16}/> FL Recommendations</button>
               <button onClick={() => setActiveTab('comms')}     className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'comms'     ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}><MessageSquare size={16}/> Edge Communications</button>
           </div>
       )}

       {/* Dynamic UI Content */}
       <div className="w-full">
           {subjects.length === 0 ? (
               <div className="theme-panel py-20 text-center border-dashed border-2">
                   <h2 className="text-xl font-bold text-[var(--text-secondary)]">Subject assignment array is currently missing.</h2>
                   <p className="text-sm mt-2 opacity-60">Please request Global Admin to configure your identity mappings.</p>
               </div>
           ) : (
               <>
                   {activeTab === 'analytics' && renderAnalyticsTab()}
                   {activeTab === 'targets' && renderTargetsTab()}
                   {activeTab === 'ml' && renderMLTab()}
                   {activeTab === 'comms' && renderCommsTab()}
               </>
           )}
       </div>

       {/* --- Mongoose & SQL Drilldown Modal Overlay --- */}
       {drillDownStudent && (
           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
               <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                   <div className="p-6 border-b border-[var(--border-divider)] flex justify-between items-center bg-[var(--bg-surface)]">
                       <h3 className="text-2xl font-bold flex items-center gap-2"><User className="text-accent"/> Profile Extraction</h3>
                       <button onClick={() => setDrillDownStudent(null)} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors p-1"><AlertTriangle size={24} className="opacity-0" /><span className="absolute right-6 top-6">✕</span></button>
                   </div>
                   
                   <div className="p-6 space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
                               <p className="text-xs text-[var(--text-secondary)] font-bold uppercase mb-1 border-b pb-1">Mongo Profile Segment</p>
                               <h4 className="font-bold text-lg mt-2">{drillDownStudent.fullName}</h4>
                               <p className="font-mono text-xs">{drillDownStudent.enrollment_id}</p>
                               <p className="text-sm mt-2 opacity-80">Subject Target: {selectedSubject.toUpperCase()}</p>
                           </div>
                           <div className="p-4 bg-[var(--bg-surface)] rounded-lg text-right">
                               <p className="text-xs text-[var(--text-secondary)] font-bold uppercase mb-1 border-b pb-1">SQL Live Segment</p>
                               <p className="text-4xl font-mono text-accent mt-2">{drillDownStudent.marks || 0}</p>
                               <p className="text-sm mt-1">Grade Matrix: <span className="font-bold">{drillDownStudent.grade || 'Pending'}</span></p>
                           </div>
                       </div>
                       
                       <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-divider)] rounded-lg">
                           <h4 className="font-bold mb-2">Mentor Remarks Node</h4>
                           <textarea className="theme-input w-full text-sm font-mono" readOnly value={drillDownStudent.remarks || 'No override remarks found in SQL root.'} rows="3"></textarea>
                       </div>
                   </div>
                   
                   <div className="p-6 border-t border-[var(--border-divider)] flex justify-end">
                       <button onClick={() => setDrillDownStudent(null)} className="theme-btn px-6 bg-accent shadow-accent/20">Close Modal</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}
