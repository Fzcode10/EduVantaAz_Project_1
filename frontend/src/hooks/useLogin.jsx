// ─── DEPRECATED — NOT USED IN ACTIVE FLOW ────────────────────────────────────
// This hook called /api/student/login which:
//   • returned only { email, token } — missing role, fullName, isRegistered
//   • the login route is now commented out in routes/student.js
//
// ACTIVE LOGIN FLOW:
//   Login.jsx → POST /api/auth/login (authControllers.js)
//   Returns: { fullName, email, role, isRegistered, token }
//   Token payload: { _id, role }  ← required by ProtectedRoute & studentGuard
//
// If you need to re-enable this hook, update it to call /api/auth/login instead.
// ─────────────────────────────────────────────────────────────────────────────

// import React, { useState, useContext } from 'react';
// import { AuthContext } from '../contextProvider/authContext';

// export const useLogin = () => {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const { dispatch } = useContext(AuthContext);

//     const login = async (email, password) => {
//         setLoading(true);
//         setError(null);
//         try {
//             // BUG WAS HERE: called old /api/student/login — returned incomplete payload
//             const response = await fetch('/api/auth/login', {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email, password })
//             });
//             const json = await response.json();
//             if (response.ok) {
//                 localStorage.setItem("student", JSON.stringify(json));
//                 dispatch({ type: 'LOGIN', payload: json });
//             } else {
//                 throw Error(json.error);
//             }
//         } catch (error) {
//             setError(error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return { login, error, loading };
// };