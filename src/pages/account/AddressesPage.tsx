import { useState } from "react";
import { Plus, MapPin, Pencil, Trash2, Check } from "lucide-react";
import { mockAddresses, type Address } from "@/lib/mock-data";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function AddressesPage() {

  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showForm, setShowForm] = useState(false);

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Default address updated");
  };

  const remove = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-[var(--font-heading)]">Saved Addresses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add New
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h3 className="text-sm font-semibold mb-2">New Address</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Full name"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              placeholder="Phone number"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              placeholder="Address line 1"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
            />
            <input
              placeholder="Address line 2 (optional)"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
            />
            <input
              placeholder="City"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              placeholder="State"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              placeholder="PIN Code"
              className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select className="w-full h-10 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="h-9 px-4 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                toast.success("Address added!");
              }}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Save Address
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-card rounded-2xl border p-5 relative ${addr.isDefault ? "ring-2 ring-primary/30" : ""}`}
          >
            {addr.isDefault && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Default
              </span>
            )}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">{user?.name}</div>
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {addr.type}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.city}, {addr.state} - {addr.pincode}
              <br />
              Phone: {user?.phone}
            </p>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => remove(addr.id)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr.id)}
                  className="ml-auto text-xs font-medium text-primary hover:underline"
                >
                  Set as default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
