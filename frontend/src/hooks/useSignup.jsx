import { useState, useContext } from "react";
import { AuthContext } from '../contextProvider/authContext';

export const Signup = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {dispatch} = useContext(AuthContext);

  const signup = async (formData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/student/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await response.json();
      console.log(JSON.stringify(json));

      if (response.ok) {
        // local storage
        localStorage.setItem("student", JSON.stringify(json));

        dispatch({ type: "LOGIN", payload: json });

        setIsLoading(false);
      } else {
        setIsLoading(false);
        throw Error(json.error);
      }
    } catch (error) {
      setError(error.message);
      console.log(error.message);
    }
  };

  return { signup, error, isLoading };
};
