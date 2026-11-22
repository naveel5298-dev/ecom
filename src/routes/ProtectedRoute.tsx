import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }:any) {

   const token = localStorage.getItem( "token");

   if (!token) {
    window.alert("Please login to access this page.");
      return <Navigate to="/login" />;
   }

   return children;
}

export default ProtectedRoute; 