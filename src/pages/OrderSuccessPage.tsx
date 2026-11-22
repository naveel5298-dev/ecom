import { Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function OrderSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <CheckCircle className="w-20 h-20 mx-auto text-success mb-6" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">Order Confirmed! 🎉</h1>
        <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
        <p className="text-sm text-muted-foreground mb-8">
          Order #DC-{Math.random().toString(36).substring(2, 8).toUpperCase()} • Estimated delivery
          in 3-5 days
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border font-medium text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" /> Track Order
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
