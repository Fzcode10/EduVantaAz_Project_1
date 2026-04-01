import {createContext} from 'react'

export const StudentContext = createContext();

export const BioContextProvider = ({children}) => {

    const st = "Fadscs"

    return (
        <StudentContext.Provider value={{st}}>
            {children}
        </StudentContext.Provider>
    )
}