import { useReducer, createContext, useEffect } from "react";

export const AuthContext = createContext();

export const studentAuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  // Synchronously initialize state to prevent React Router race conditions dropping users immediately 
  const initializeUser = () => {
    try {
        const stored = localStorage.getItem("student");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
  };

  const [state, dispatch] = useReducer(studentAuthReducer, {
    user: initializeUser(),
  });

  console.log("auth : ", state);

  useEffect(() => {
    // Keep this just in case other tabs update localStorage (storage event sync placeholder)
    const student = initializeUser();
    if (student && !state.user) {
      dispatch({ type: "LOGIN", payload: student });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
