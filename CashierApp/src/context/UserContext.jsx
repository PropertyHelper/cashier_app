import { createContext, useContext, useState } from "react";

const UserContext = createContext();

// provider to avoid passing props from parent down to every child (like with token :) )
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // wraps children inside it and allows access to user and setUser
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// custom react hook to access user and setUser
export const useUser = () => useContext(UserContext);
