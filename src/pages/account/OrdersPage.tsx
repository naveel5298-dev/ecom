import { useState } from "react";
import { Package, Truck, CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";
import { mockOrders, formatPrice } from "@/lib/mock-data";

const statusConfig = {
  Processing: { icon: Clock, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
  Shipped: { icon: Truck, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  Delivered: { icon: CheckCircle2, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  Cancelled: { icon: XCircle, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
} as const;

const tabs = ["All", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

export function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("All");

  const filtered =
    activeTab === "All" ? mockOrders : mockOrders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold font-[var(--font-heading)]">Order History</h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={order.id} className="bg-card rounded-2xl border overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-muted/30 border-b">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{order.id}</span>
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                    >
                      <StatusIcon className="w-3 h-3" /> {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(item.productPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t bg-muted/20">
                  <span className="text-sm font-semibold">Total: {formatPrice(order.total)}</span>
                  <div className="flex gap-2">
                    {order.trackingId && order.status !== "Cancelled" && (
                      <button className="h-8 px-3 rounded-lg border text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Track
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <button className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
