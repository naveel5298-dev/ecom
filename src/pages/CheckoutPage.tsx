import { Link } from "react-router-dom";
import { useState } from "react";
import { Check, CreditCard, MapPin, Truck, Shield, Lock, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { CartItem } from "@/redux/cartSlice";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { makePaymentApi, verifyPaymentApi } from "@/api/paymentApi";

const steps = ["Address", "Delivery", "Payment", "Review"];

declare global {
  interface Window {
    Razorpay: any; // or the proper Razorpay type if available
  }
}

export function CheckoutPage() {
  const { user } = useAuth();

  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );



  const [loading, setLoading] = useState(false);
  const payNow = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.alert("Please log in to continue");
        return;
      }

      const makePaymentResponse = await makePaymentApi({
        amount: totalPrice,
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });
      if (!makePaymentResponse.ok || makePaymentResponse.status !== "success") {
        throw new Error(makePaymentResponse.message || "Could not create order");
      }
      const order = makePaymentResponse.data;

      if (!window.Razorpay) {
        throw new Error("Payment checkout has not loaded");
      }
    
    // catch(error){
    //   window.alert(error instanceof Error ? error.message : "Something went wrong");
    // };
    
    // const order = await makePaymentApi({
    //   amount: totalPrice,
    //   currency: "INR",
    //   receipt: `order_${Date.now()}`,
    // });

    if (!order || order.status !== "success") {
      window.alert("Could not create order. Please try again.");
      setLoading(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      name: "My E-commerce Store",
      description: "Order payment",

      handler: async (payment: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Step 3: Send the response to your backend.
          const verifyResponse = await verifyPaymentApi(payment);

          const result = await verifyResponse.json();

          if (!verifyResponse.ok || result.status !== "success") {
            window.alert("Payment could not be verified");
            return;
          }

          // Navigate to the order confirmation page only
          // after the backend confirms payment is captured.
          window.alert("Payment verified");
          // navigate("/order-success");
        }
      

        catch {
          window.alert(
            "Could not confirm payment. Please check your order status."
          );
        }
      },
    });
  
    try {
    checkout.on("payment.failed", () => {
      window.alert("Payment failed. Please try again.");
    });
  
    checkout.open();
    }

    catch (error) {
    window.alert(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
 }
 } finally {
    setLoading(false);
  }

};


const [step, setStep] = useState(0);

const [addresses, setAddresses] = useState([
  {
    id: "1",
    type: "HOME",
    name: user?.name || "Guest User",
    addressLine: user?.address || "42, Green Park Colony, Sector 15, Noida, UP - 201301",
    phone: user?.phone || "+91 9876543210"
  }
]);
const [selectedAddressId, setSelectedAddressId] = useState("1");
const [deliveryOptionId, setDeliveryOptionId] = useState("standard");
const [paymentMethod, setPaymentMethod] = useState("card");

const baseDeliveryFee = totalPrice >= 499 ? 0 : 49;
const deliveryFee = deliveryOptionId === "standard" ? baseDeliveryFee : (deliveryOptionId === "express" ? 99 : 199);

if (items.length === 0) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold font-[var(--font-heading)] mb-2">Nothing to checkout</h2>
      <Link to="/products" className="text-primary text-sm hover:underline">
        Browse products
      </Link>
    </div>
  );
}

return (
  <div className="max-w-4xl mx-auto px-4 py-6">
    {/* Progress */}
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step
              ? "bg-success text-success-foreground"
              : i === step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
              }`}
          >
            {i < step ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span
            className={`hidden sm:block text-sm font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 ${i < step ? "bg-success" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 && <AddressStep addresses={addresses} setAddresses={setAddresses} selectedAddressId={selectedAddressId} setSelectedAddressId={setSelectedAddressId} />}
          {step === 1 && <DeliveryStep selected={deliveryOptionId} setSelected={setDeliveryOptionId} baseDeliveryFee={baseDeliveryFee} />}
          {step === 2 && <PaymentStep method={paymentMethod} setMethod={setPaymentMethod} />}
          {step === 3 && <ReviewStep selectedAddress={addresses.find(a => a.id === selectedAddressId)} deliveryOption={deliveryOptionId} paymentMethod={paymentMethod} />}
        </motion.div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          ) : (
            <Link
              to="/order-success"
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Place Order
            </Link>
          )}
        </div>
      </div>

      {/* Order summary sidebar */}
      <div className="bg-card rounded-2xl border p-5 h-fit sticky top-24">
        <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3">Order Summary</h3>
        <div className="space-y-3 mb-4">
          {items.slice(0, 3).map((item: CartItem) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="text-xs font-bold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>
          )}
        </div>
        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className={deliveryFee === 0 ? "text-success" : ""}>
              {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(totalPrice + deliveryFee)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-success" />
          <span>Safe & Secure Checkout</span>
        </div>
      </div>
    </div>
  </div>
);
    }

function AddressStep({ addresses, setAddresses, selectedAddressId, setSelectedAddressId }: any) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: "HOME", name: "", addressLine: "", phone: "" });

  const handleSave = () => {
    if (!newAddress.name || !newAddress.addressLine || !newAddress.phone) return;
    const newId = Date.now().toString();
    setAddresses([...addresses, { id: newId, ...newAddress }]);
    setSelectedAddressId(newId);
    setIsAddingNew(false);
    setNewAddress({ type: "HOME", name: "", addressLine: "", phone: "" });
  };

  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="flex items-center gap-2 mb-5">
        <MapPin className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Delivery Address</h2>
      </div>

      {!isAddingNew ? (
        <>
          <div className="space-y-4 mb-4">
            {addresses.map((addr: any) => (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {addr.type}
                    </span>
                    <p className="text-sm font-semibold mt-2">{addr.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {addr.addressLine}
                    </p>
                    <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                  </div>
                  {selectedAddressId === addr.id && <Check className="w-5 h-5 text-primary shrink-0" />}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsAddingNew(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            + Add New Address
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <input
            placeholder="Full Name"
            value={newAddress.name}
            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            placeholder="Phone Number"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            placeholder="Full Address"
            value={newAddress.addressLine}
            onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
            className="w-full p-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
          />
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Save Address
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="flex-1 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveryStep({ selected, setSelected, baseDeliveryFee }: any) {
  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="flex items-center gap-2 mb-5">
        <Truck className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Delivery Options</h2>
      </div>
      <div className="space-y-3">
        {[
          { id: "standard", label: "Standard Delivery", desc: "3-5 business days", price: baseDeliveryFee === 0 ? "FREE" : `₹${baseDeliveryFee}` },
          { id: "express", label: "Express Delivery", desc: "1-2 business days", price: "₹99" },
          { id: "same-day", label: "Same Day Delivery", desc: "Today by 9 PM", price: "₹199" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${selected === opt.id
              ? "border-primary bg-primary/5"
              : "hover:border-muted-foreground/30"
              }`}
          >
            <div>
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
            <span className={`text-sm font-bold ${opt.price === "FREE" ? "text-success" : ""}`}>
              {opt.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PaymentStep({ method, setMethod }: any) {
  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold font-[var(--font-heading)]">Payment Method</h2>
      </div>
      <div className="space-y-3 mb-6">
        {[
          { id: "card", label: "Credit / Debit Card" },
          { id: "upi", label: "UPI" },
          { id: "wallet", label: "DesiCart Wallet" },
          { id: "cod", label: "Cash on Delivery" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setMethod(opt.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${method === opt.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
              }`}
          >
            <span className="text-sm font-medium">{opt.label}</span>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === opt.id ? "border-primary" : "border-muted-foreground/30"}`}
            >
              {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        ))}
      </div>

      {method === "card" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Card Number"
            className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM/YY"
              className="h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              placeholder="CVV"
              className="h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <input
            type="text"
            placeholder="Name on card"
            className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {method === "upi" && (
        <input
          type="text"
          placeholder="Enter UPI ID (e.g. name@paytm)"
          className="w-full h-11 px-4 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}
    </div>
  );
}

function ReviewStep({ selectedAddress, deliveryOption, paymentMethod }: any) {
  const items = useSelector(
    (state: RootState) =>
      state.cart.items
  );

  const deliveryLabel = deliveryOption === "express" ? "Express • 1-2 business days" :
    deliveryOption === "same-day" ? "Same Day • Today by 9 PM" :
      "Standard • 3-5 business days";

  return (
    <div className="bg-card rounded-2xl border p-5">
      <h2 className="text-lg font-bold font-[var(--font-heading)] mb-5">Review Your Order</h2>
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Deliver to</p>
          <p className="text-sm font-medium">{selectedAddress?.name}, {selectedAddress?.addressLine}</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Delivery</p>
          <p className="text-sm font-medium">{deliveryLabel}</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Payment</p>
          <p className="text-sm font-medium">
            {paymentMethod === "card" ? "Credit / Debit Card" :
              paymentMethod === "upi" ? "UPI" :
                paymentMethod === "wallet" ? "DesiCart Wallet" :
                  "Cash on Delivery"}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
            Items ({items.length})
          </p>
          {items.map((item: CartItem) => (
            <div key={item.productId} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm flex-1 line-clamp-1">{item.title}</span>
              <span className="text-sm font-bold">
                {formatPrice(item.price)} × {item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
