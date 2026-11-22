import { Loader } from "@/components/ui/loader";
import {
   createContext,
   useContext,
   useState,
} from "react";
import { useNavigate } from "react-router-dom";


const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
   const nav = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState("");

   const [user, setUser] = useState(() => {

      const stored = localStorage.getItem("logininfo");

      if (stored) {
         return JSON.parse(stored).data.user;
      }

      return null;
   });

   const login = (userData: any) => {

      setUser(userData);
      localStorage.setItem("token", userData.access_token);

      localStorage.setItem(
         "logininfo",
         JSON.stringify({
            data: {
               user: userData
            }
         })
      );
   };

   const logout = () => {

      setUser(null);
      nav("/login");

      localStorage.removeItem("logininfo");
      localStorage.removeItem("token");
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            login,
            logout,
            setIsLoading,
            setMessage
         }}
      >
         <Loader isEnabled={isLoading} message={message} />
         {children}
      </AuthContext.Provider>
   );
}

export const useAuth = () => {
   return useContext(AuthContext);
};