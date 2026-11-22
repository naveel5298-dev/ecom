import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { SignupApi } from "@/api/authApi";

export function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

      const [data, setData]:any = useState()
   const nav = useNavigate();

    const handleChange = (event:any) => {
        setData({ ...data, [event.target.name]: event.target.value })
    }

    const handleSubmit = async (event:any) => {
        event.preventDefault();
        console.log(data);
        const respo = await SignupApi(data);

        if (respo.status === "success"){
           window.alert("Signup Successfully");
           setTimeout(()=>nav("/account/profile"),2000)
        }
        else{
            window.alert("Signup Failed,Try Again")
        }
            
    }




  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join DesiCart for the best deals</p>
        </div>
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              type="text"
              name="name"
              placeholder="Full name"
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
           <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              type="text"
              name="phone"
              placeholder="Phone number"
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              type={showPw ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full h-11 pl-10 pr-10 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPw ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              onChange={handleChange}
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              className="w-full h-11 pl-10 pr-10 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showConfirm ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <button onClick={handleSubmit} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            Create Account
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
