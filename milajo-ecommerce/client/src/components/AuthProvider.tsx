import { createContext, Dispatch, SetStateAction, useState, ReactNode } from "react";

export const AuthContext = createContext<string>('');
export const AuthDispatchContext = createContext<Dispatch<SetStateAction<string>> | undefined>(undefined);



function AuthProvider(props: { children: ReactNode }) {
  const { children } = props;
  const [loggedInUser, setLoggedInUser] = useState('');


  return (
    <AuthContext.Provider value={loggedInUser}>
      <AuthDispatchContext.Provider value={setLoggedInUser}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
};
export default AuthProvider;