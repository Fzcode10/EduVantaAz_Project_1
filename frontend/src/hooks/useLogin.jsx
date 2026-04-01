import React, { useState, useContext } from 'react';
import { AuthContext } from '../contextProvider/authContext';

export const useLogin = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {dispatch} = useContext(AuthContext);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/student/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const json = await response.json();
            // console.log(JSON.stringify(json));

            if(response.ok){
                // local storage
                localStorage.setItem("student" , JSON.stringify(json));

                dispatch({type: 'LOGIN', payload: json});

                setLoading(false);
            }else{
                setLoading(false);
                throw Error(json.error)
            }

        }catch (error) {
            setError(error.message);
            console.log(error.message);
        }

    }

    return {login, error, loading};
}