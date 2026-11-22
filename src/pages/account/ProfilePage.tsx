import { use, useContext, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";


  export function ProfilePage() {

  const { user,logout }: any = useAuth();
  console.log("user:", user?.name);
const [form, setForm] = useState({
   name: "",
   email: "",
    phone: "",
    gender: "",
    dob: "",
});

useEffect(() => {
   if (user) {
      setForm({
         name: user?.name || "",
         email: user?.email || "",
         phone: user?.phone || "9999999999",
         gender: user?.gender || "",
         dob: user?.dob || "DD/MM/YYYY",
      });
   }
}, [user]);

    const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

    return (
      <div className="space-y-6">
        
        <div className="bg-card rounded-2xl border p-6">
          
          <h2 className="text-lg font-semibold font-[var(--font-heading)] mb-6">
            Personal Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                RS
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
            <div>
              <div className="font-semibold">{form.name}</div>
            <div className="text-xs text-muted-foreground">Member since Jan 2024</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Email Address
            </label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              type="email"
              className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Date of Birth
            </label>
            <input
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              type="date"
              className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => toast.success("Profile updated successfully!")}
            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
