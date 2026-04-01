import React, { useState } from "react";
import {Signup} from '../hooks/useSignup'

const Signupform = ({email}) => {

  const {signup, error, isLoading} = Signup();

  const [formData, setFormData] = useState({
    fullName: "",
    email: email,
    phone: "",
    enrollment: "",
    course: "",
    semester: "",
    dob: "",
    gender: "",
    state: "",
    district: "",
    area: "",
    password: "",
    conformPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if(formData.password != formData.conformPassword){
      console.log('password not matched');
      setError("One look on conform password");
    }

    signup(formData);
    console.log(error);
    console.log(isLoading);


  };

  // Reusable Tailwind Class for Inputs
  const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white";

  return (
    <div className="min-h-screen  from-indigo-50 to-blue-100 flex items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Branding/Info */}
        <div className="hidden md:flex md:w-1/3 bg-indigo-600 p-10 flex-col justify-center text-white">
          <h2 className="text-4xl font-bold mb-4">Join Us.</h2>
          <p className="text-indigo-100 mb-8">Create your student account to access the portal and manage your academic journey.</p>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="bg-indigo-500 p-2 rounded-full text-xs">✓</span>
                <span>Track Performance</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="bg-indigo-500 p-2 rounded-full text-xs">✓</span>
                <span>Access Materials</span>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Registration</h1>
          <p className="text-gray-500 mb-8">Please fill in your details accurately.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section: Personal Info */}
            <div className="md:col-span-2 border-b pb-2">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Academic Details</p>
            </div>

            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={inputStyle} />
            <span  className={inputStyle}>{email}</span>
            <input type="number" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputStyle} />
            <input type="text" name="enrollment" placeholder="Enrollment No" value={formData.enrollment} onChange={handleChange} className={inputStyle} />
            
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} className={inputStyle} />
                <input type="text" name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} className={inputStyle} />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1 ml-1">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputStyle} />
            </div>

            {/* Section: Location */}
            <div className="md:col-span-2 border-b pb-2 mt-4">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Address & Identity</p>
            </div>

            <div className="flex flex-col justify-center px-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Gender</p>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="gender" value={g.toLowerCase()} onChange={handleChange} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center px-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Area Type</p>
              <div className="flex gap-4">
                {["Rural", "Urban"].map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="area" value={a.toLowerCase()} onChange={handleChange} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className={inputStyle} />
            <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} className={inputStyle} />

            {/* Section: Security */}
            <div className="md:col-span-2 border-b pb-2 mt-4">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Security</p>
            </div>

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputStyle} />
            <input type="password" name="conformPassword" placeholder="Confirm Password" value={formData.conformPassword} onChange={handleChange} className={inputStyle} />

            <button
              type="submit"
              className="md:col-span-2 mt-4 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Already have an account? <a href="/login" className="text-indigo-600 font-semibold hover:underline">Log in</a>
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm animate-shake">
              {/* Alert Icon */}
              <div className="text-red-500 shrink-0 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="flex flex-col">
                <p className="text-sm font-bold text-red-800 leading-none mb-1">
                  Action Required
                </p>
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signupform;