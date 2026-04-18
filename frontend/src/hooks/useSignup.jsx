// ─── DEPRECATED — NOT USED IN ACTIVE FLOW ────────────────────────────────────
// This hook called /api/student/signup which:
//   • returned only { email, token } — missing role, fullName, isRegistered
//   • had NO OTP email verification before account creation
//   • the signup route is now commented out in routes/student.js
//
// ACTIVE REGISTRATION FLOW:
//   Register.jsx → POST /api/auth/send-otp  (Step 1: send OTP)
//               → POST /api/auth/verify-otp (Step 2: verify OTP → get registrationToken)
//               → POST /api/auth/register   (Step 3: create account with token)
//   Returns: { fullName, email, role, isRegistered, token }
//   Token payload: { _id, role }  ← required by ProtectedRoute & studentGuard
//
// If you need to re-enable this hook, update it to use /api/auth/* instead.
// ─────────────────────────────────────────────────────────────────────────────

// import { useState, useContext } from "react";
// import { AuthContext } from '../contextProvider/authContext';

// export const Signup = () => {
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { dispatch } = useContext(AuthContext);

//   const signup = async (formData) => {
//     setIsLoading(true);
//     try {
//       // BUG WAS HERE: called old /api/student/signup — no OTP, incomplete payload
//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
//       const json = await response.json();
//       if (response.ok) {
//         localStorage.setItem("student", JSON.stringify(json));
//         dispatch({ type: "LOGIN", payload: json });
//       } else {
//         throw Error(json.error);
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return { signup, error, isLoading };
// };
