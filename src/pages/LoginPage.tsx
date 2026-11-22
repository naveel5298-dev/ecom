import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { LoginApi } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/interceptor";
import { ROUTES } from "@/utility/url";


export function LoginPage() {
  const { login, setIsLoading, setMessage } = useAuth();

  const [showPw, setShowPw] = useState(false);

  const [Data, setData]: any = useState();
  const nav = useNavigate();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("Logging in...");
    console.log(Data);
    // const res = api.post(ROUTES.login).then((response) => {
    //   console.log("CSRF cookie set:", response);
    // }).catch((error) => {
    //   console.error("Error setting CSRF cookie:", error);
    // });

    const Response = await LoginApi(Data);

    if (Response.status === "success") {
      setIsLoading(false);
      localStorage.setItem("logininfo", JSON.stringify(Response));

      localStorage.setItem("token", Response.data.access_token)
      console.log(Response.data.access_token);

      login(Response.data);
      //              console.log("response:", Response);
      // console.log("response.data:", Response.data);
      // console.log("response.data.user:", Response.data.user);

     // window.alert("Login Successfully")
      setTimeout(() => nav("/account/profile"), 1500)
    }
    else {
      setIsLoading(false);
      window.alert("Login Failed")
    }

  }

  const handleChange = (event: any) => {
    setData({ ...Data, [event.target.name]: event.target.value })
  }




  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your DesiCart account</p>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              name="email"
              type="email"
              placeholder="Email address"
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Password"
              className="w-full h-11 pl-10 pr-10 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex justify-end">
            <button className="text-xs text-primary hover:underline">Forgot password?</button>
          </div>
          <button onClick={handleSubmit} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            Sign In
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">
              Google
            </button>
            <button className="h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">
              Apple
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
