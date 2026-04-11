import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../contextProvider/authContext';
import axios from 'axios';
import { 
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ComposedChart 
} from 'recharts';
import { 
  Activity, Target, Clock, ShieldCheck, Cpu, Play, Square, MessageSquare, AlertTriangle, Check, BookOpen, Download
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);

  // States
  const [performance, setPerformance] = useState([]);
  const [targets, setTargets] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [materialSubject, setMaterialSubject] = useState('');
  
  // Stopwatch Internal State
  const [timerActive, setTimerActive] = useState(false);
  const [timePassed, setTimePassed] = useState(0); 
  const [timerSubject, setTimerSubject] = useState('');
  const [distractions, setDistractions] = useState(0);
  const timerRef = useRef(null);
  
  // Form State
  const [newTicket, setNewTicket] = useState({ subjectId: '', mentorId: '', query: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // ─── NETWORK FETCHING ──────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [perfRes, targRes, recRes, logsRes, tickRes] = await Promise.all([
        axios.get('/api/student/my-data', config),
        axios.get('/api/student/targets', config),
        axios.get('/api/student/recommendations', config),
        axios.get('/api/student/activity-logs', config),
        axios.get('/api/student/tickets', config)
      ]);
      setPerformance(perfRes.data);
      setTargets(targRes.data);
      setRecommendations(recRes.data);
      setLogs(logsRes.data);
      setTickets(tickRes.data);
    } catch (err) { console.error("Data Sync Failure: ", err); }
  };

  useEffect(() => {
    if (user && user.token) fetchData();
  }, [user]);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  // ─── TRUTH STOPWATCH LOGIC (Strict Mode) ───────────────────────────
  useEffect(() => {
     const handleUnload = (e) => {
         if (timerActive) {
             e.preventDefault();
             e.returnValue = "Truth Stopwatch is active! Stop the timer before leaving the page safely.";
         }
     };
     
     const handleVisibility = () => {
         if (timerActive && document.hidden) {
             setDistractions(prev => prev + 1);
             showStatus('error', 'Distraction Logged: Focus Tab left natively during Active Session!');
         }
     };

     window.addEventListener('beforeunload', handleUnload);
     document.addEventListener('visibilitychange', handleVisibility);
     return () => {
         window.removeEventListener('beforeunload', handleUnload);
         document.removeEventListener('visibilitychange', handleVisibility);
     };
  }, [timerActive]);

  const toggleStopwatch = async () => {
      if (!timerSubject) return showStatus('error', 'Select a target Subject to begin deep focus tracking.');

      if (!timerActive) {
          // START TIMER
          setTimerActive(true);
          setTimePassed(0);
          setDistractions(0);
          timerRef.current = setInterval(() => {
              setTimePassed(prev => prev + 1);
          }, 1000);
      } else {
          // STOP AND LOG TIMER
          setTimerActive(false);
          clearInterval(timerRef.current);
          try {
             const config = { headers: { Authorization: `Bearer ${user.token}` } };
             await axios.post('/api/student/study-session', {
                 subjectId: timerSubject, durationInSeconds: timePassed, distractionsLogged: distractions
             }, config);
             showStatus('success', `Truth Session securely transmitted: ${Math.round(timePassed/60)}m active.`);
             setTimePassed(0);
             fetchData(); // Reload activity log
          } catch (err) { showStatus('error', 'Failed recording Truth Session loop.'); }
      }
  };

  const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  // ─── TARGET HANDLERS ──────────────────────────────────────────────
  const handleTargetUpdate = async (targetId, currentProgress, max, forceComplete = false) => {
      let status = forceComplete ? 'completed' : 'pending';
      if (currentProgress >= max) status = 'completed';

      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/student/targets/${targetId}`, { currentProgress, status }, config);
          fetchData();
      } catch (err) { console.error(err); }
  };

  // ─── TICKET HANDLERS ──────────────────────────────────────────────
  const handleTicketSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log(newTicket);
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/student/tickets', newTicket, config);
          showStatus('success', 'Doubt securely lodged natively with active Mentor constraints.');
          setNewTicket({ subjectId: '', mentorId: '', query: '' });
          fetchData();
      } catch (err) { showStatus('error', err.response?.data?.error); }
  };

  // ─── MATERIALS HANDLERS ───────────────────────────────────────────
  const handleFetchMaterials = async (subjectId) => {
      setMaterialSubject(subjectId);
      if (!subjectId) {
          setMaterials([]);
          return;
      }
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.get(`/api/student/materials/${subjectId}`, config);
          setMaterials(res.data);
      } catch (err) { console.error("Failed to fetch materials: ", err); }
  };


  if (!user) return <div className="p-8">Syncing Architecture...</div>;

  return (
    <div className="min-h-screen max-w-[1400px] mx-auto p-4 md:p-8 relative">
       {/* Global Banner */}
       <div className="theme-panel w-full p-6 mb-8 flex justify-between items-center bg-teal-600 text-white border-none shadow-lg shadow-teal-600/20">
           <div>
               <h1 className="text-3xl font-bold flex items-center gap-3"><Activity /> Student Dashboard</h1>
               <p className="mt-1 text-white/80 text-sm">Welcome {user.fullName} ({user.enrollment})</p>
           </div>
       </div>

       {/* Floating Notification */}
       {statusMsg.text && (
            <div className={`fixed top-8 right-8 z-50 p-4 rounded-xl shadow-2xl transition-all flex items-center gap-3 animate-in slide-in-from-right-8 border ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/30 font-bold' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                {statusMsg.type === 'error' ? <AlertTriangle size={20}/> : <Check size={20}/>}
                <span>{statusMsg.text}</span>
            </div>
       )}

       {/* GRID LAYOUT: 5 MODULES */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           
           {/* LEFT COL: Performance Hub & Targets (2/3 width) */}
           <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
               
               {/* 1. Performance Hub */}
               <div className="theme-panel p-6 shadow-xl border-t-4 border-t-blue-500">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="text-blue-500"/> Personal Performance</h2>
                   <p className="text-xs text-[var(--text-secondary)] mb-6 tracking-wide">Dynamically comparing SQL Marking logic alongside MongoDB mapped Attendance Vectors.</p>
                   
                   <div className="h-[300px] w-full bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-divider)]">
                      {performance.length === 0 ? <p className="text-center mt-20 opacity-50 italic">Awaiting from Mentors side.</p> : (
                          <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={performance.map(p => ({ subject: p.subjectName, SQLGrade: p.sqlMark, Attendance: p.attendancePct }))}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                  <XAxis dataKey="subject" tick={{fontSize: 12}} stroke="var(--text-secondary)" />
                                  <YAxis stroke="var(--text-secondary)" />
                                  <RechartsTooltip contentStyle={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-divider)'}} />
                                  <Bar dataKey="SQLGrade" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                  <Line type="monotone" dataKey="Attendance" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                              </ComposedChart>
                          </ResponsiveContainer>
                      )}
                   </div>
               </div>

               {/* 2. Target Management */}
               <div className="theme-panel p-6 shadow-xl border-t-4 border-t-teal-500">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Target className="text-teal-500"/> Goal Assignment Monitoring</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {targets.length === 0 ? <p className="text-[var(--text-secondary)] italic">No active structural vectors designated.</p> : targets.map(t => (
                           <div key={t.id} className={`p-5 rounded-xl border transition-colors ${t.status === 'completed' ? 'bg-green-500/10 border-green-500/30' : 'bg-[var(--bg-primary)] border-[var(--border-divider)]'}`}>
                               <div className="flex justify-between items-start mb-2">
                                   <h3 className="font-bold text-lg leading-tight">{t.title}</h3>
                                   <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${t.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-teal-500/20 text-teal-500'}`}>{t.status}</span>
                               </div>
                               <p className="text-sm font-mono mb-6 text-[var(--text-secondary)]">{t.currentProgress} / {t.targetMetric} Mapped Units</p>
                               
                               {/* Interactive Range Slider */}
                               <input 
                                   type="range" 
                                   min="0" max={t.targetMetric} 
                                   value={t.currentProgress} 
                                   disabled={t.status === 'completed'}
                                   onChange={(e) => handleTargetUpdate(t.id, Number(e.target.value), t.targetMetric, false)}
                                   className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-teal-500 mb-4"
                               />
                               
                               {t.status !== 'completed' && (
                                   <button 
                                      onClick={() => handleTargetUpdate(t.id, t.targetMetric, t.targetMetric, true)}
                                      className="text-xs w-full py-2 bg-[var(--bg-secondary)] hover:bg-teal-500 hover:text-white transition-colors rounded border border-[var(--border-divider)] font-bold">
                                      Flag Global Completion
                                   </button>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
               
               {/* 2.5 Syllabus Repository Module */}
               <div className="theme-panel p-6 shadow-xl border-t-4 border-t-indigo-500">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-indigo-500"/> Syllabus Materials Repository</h2>
                   <div className="flex flex-col md:flex-row gap-6">
                       <div className="flex-1">
                           <select value={materialSubject} onChange={(e) => handleFetchMaterials(e.target.value)} className="theme-input bg-[var(--bg-secondary)] mb-4">
                               <option className="text-black" value="">Select Target Subject for Syllabus</option>
                               {performance.map(p => <option className="text-black" key={p.subjectId} value={p.subjectId}>{p.subjectName}</option>)}
                           </select>
                           <p className="text-xs text-[var(--text-secondary)]">Mentors drop syllabus updates directly into the specific module repository. Please select an array to download PDFs natively.</p>
                       </div>
                       
                       <div className="flex-1 space-y-3 h-48 overflow-y-auto pr-2 border-l border-[var(--border-divider)] md:pl-6">
                           {materialSubject === '' ? (
                               <p className="text-center mt-10 text-[var(--text-secondary)] italic text-sm">Select vector to mount module.</p>
                           ) : materials.length === 0 ? (
                               <p className="text-center mt-10 text-[var(--text-secondary)] italic text-sm">Payload repository empty for this subject.</p>
                           ) : materials.map(m => (
                               <div key={m.id} className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-divider)] rounded flex justify-between items-center transition hover:bg-[var(--bg-surface)]">
                                   <span className="text-sm font-bold truncate max-w-[180px]">{m.title}</span>
                                   <a href={`http://localhost:2000${m.filePath}`} target="_blank" rel="noreferrer" className="flex gap-1 items-center bg-indigo-500 text-white text-xs px-2 py-1 rounded hover:bg-indigo-600"><Download size={14}/> View pdf </a>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
               
               {/* Bonus Comms Section (Merged into left flow visually) */}
               <div className="theme-panel p-6 shadow-xl border-t-4 border-t-orange-500">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="text-orange-500"/>Connect with mentor</h2>
                   <div className="flex flex-col md:flex-row gap-6">
                       <form onSubmit={handleTicketSubmit} className="flex-1 space-y-4">
                           <select required value={newTicket.subjectId} onChange={e=>{
                               const selectedSubject = performance.find(p => p.subjectId === e.target.value);
                               setNewTicket({...newTicket, subjectId: e.target.value, mentorId: selectedSubject ? selectedSubject.mentorId : ''});
                           }} className="theme-input bg-[var(--bg-secondary)]">
                               <option className="text-black" value="">Select Enrolled Subject Target</option>
                               {performance.map(p => <option className="text-black" key={p.subjectId} value={p.subjectId}>{p.subjectName} </option>)}
                           </select>
                           <textarea required value={newTicket.query} onChange={e=>setNewTicket({...newTicket, query: e.target.value})} placeholder="Emit logical query sequence... mentor receives node immediately." rows="3" className="theme-input"></textarea>
                           <button type="submit" className="theme-btn w-full bg-orange-500 shadow-orange-500/20">Send query to mentor</button>
                       </form>
                       
                       <div className="flex-1 space-y-3 h-48 overflow-y-auto pr-2">
                           <h3 className="text-sm font-bold border-b pb-2 mb-2">Previous Uplinks</h3>
                           {tickets.length === 0 ? <p className="text-xs italic opacity-50">Local matrix silent.</p> : tickets.map(t => (
                               <div key={t.id} className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-divider)] rounded text-sm relative">
                                    {t.status === 'resolved' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"></span>}
                                    <p className="font-bold mb-1 opacity-70">Query: {t.query}</p>
                                    {t.response && <p className="font-mono text-orange-400">&gt; Mentor: {t.response}</p>}
                               </div>
                           ))}
                       </div>
                   </div>
               </div>

           </div>

           {/* RIGHT COL: Stopwatch, Privacy Log, ML Engine (1/3 width) */}
           <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
               
               {/* 3. Truth Stopwatch Strict Element */}
               <div className={`theme-panel p-6 shadow-2xl transition-all duration-500 border-2 ${timerActive ? 'border-red-500 scale-[1.02] shadow-red-500/20' : 'border-[var(--border-divider)]'}`}>
                   <div className="flex justify-between items-start mb-6">
                       <h2 className="text-xl font-bold flex items-center gap-2"><Clock className={timerActive ? 'text-red-500 animate-spin-slow' : 'text-[var(--text-secondary)]'}/> Truth Stopwatch</h2>
                       {timerActive && distractions > 0 && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">Alerts Logged: {distractions}</span>}
                   </div>
                   
                   <p className="text-[4rem] font-bold font-mono text-center tracking-widest text-shadow mb-6">{formatTime(timePassed)}</p>
                   
                   {timerActive ? (
                       <button onClick={toggleStopwatch} className="theme-btn w-full py-4 text-xl bg-red-600 hover:bg-red-700 shadow-red-600/30 flex justify-center gap-2"><Square /> Disengage Sequence</button>
                   ) : (
                       <div className="space-y-4">
                           <select value={timerSubject} onChange={e => setTimerSubject(e.target.value)} className="theme-input bg-[var(--bg-primary)] text-center text-sm font-bold">
                               <option value="">Select Target Focus Vector</option>
                               {performance.map(p => <option key={p.subjectId} value={p.subjectId}>{p.subjectName}</option>)}
                           </select>
                           <button onClick={toggleStopwatch} className="theme-btn w-full py-4 text-xl bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-opacity-80 flex justify-center gap-2"><Play /> Initiate Focus Node</button>
                       </div>
                   )}
                   <p className="text-[10px] text-center mt-4 opacity-50 uppercase tracking-widest">Strict Mode Active: Browser Unload Lock Enabled</p>
               </div>

               {/* 4. EduVanta Recommendation Panel */}
               <div className="theme-panel p-6 shadow-xl border-t-4 border-t-purple-500">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Cpu className="text-purple-500"/> FL Edge Network Payload</h2>
                   <p className="text-xs mb-4 text-[var(--text-secondary)]">Inbound ML recommendations verified by your assigned Mentors via the Federated protocol.</p>
                   
                   <div className="space-y-4">
                       {recommendations.length===0 ? <p className="text-sm italic opacity-50 text-center">Prediction Matrix empty. Optimal status held.</p> : recommendations.map(r => (
                           <div key={r.id} className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                               <div className="flex gap-2 mb-2 items-center">
                                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                   <span className="text-xs uppercase font-bold text-purple-500 tracking-wider">Model Insight Mapped</span>
                               </div>
                               <p className="text-sm font-semibold">{r.refinedText || r.predictionText}</p>
                           </div>
                       ))}
                   </div>
               </div>

               {/* 5. Privacy & Activity Log Segment */}
               <div className="theme-panel p-6 shadow-xl border-t-4 border-t-black dark:border-t-white bg-slate-100 dark:bg-stone-900 overflow-hidden relative">
                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono"><ShieldCheck /> Privacy Telemetry Log</h2>
                   <div className="h-48 overflow-y-auto space-y-2 font-mono text-xs pr-2">
                       {logs.length === 0 ? <p className="opacity-50 text-center mt-8">Establishing terminal root...</p> : logs.map(l => (
                           <div key={l.id} className="flex gap-3 py-1 border-b border-black/10 dark:border-white/10">
                               <span className="opacity-50 shrink-0">[{new Date(l.created_at).toLocaleTimeString()}]</span>
                               <span className={l.actionType.includes('STUDY') ? 'text-blue-500 font-bold' : l.actionType.includes('TARGET') ? 'text-teal-500' : ''}>{l.description}</span>
                           </div>
                       ))}
                   </div>
                   <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-100 dark:from-stone-900 to-transparent pointer-events-none"></div>
                   <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-100 dark:from-stone-900 to-transparent pointer-events-none"></div>
               </div>

           </div>
       </div>
    </div>
  );
}
