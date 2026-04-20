import React, { useState } from "react";
// import { AuthContext } from '../contextProvider/authContext';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedStudent = localStorage.getItem("student");

      if (!storedStudent) {
        throw Error("Login to the page first !!");
      }

      const student = JSON.parse(storedStudent);
      const email = student?.email;  
      const token = student?.token;

      const response = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
         },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw Error(json.error);
      }

      localStorage.setItem("profile", JSON.stringify(json));

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return { fetchProfileData, error, loading };
};