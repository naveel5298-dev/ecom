import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AccountLayout } from "./layouts/AccountLayout";

import { HomePage } from "./pages/HomePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SearchPage } from "./pages/SearchPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { SellerPage } from "./pages/SellerPage";

import { ProfilePage } from "./pages/account/ProfilePage";
import { OrdersPage } from "./pages/account/OrdersPage";
import { AddressesPage } from "./pages/account/AddressesPage";
import { WishlistPage } from "./pages/account/WishlistPage";
import ProtectedRoute from "./routes/ProtectedRoute";




export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/seller" element={<SellerPage />} />
        {/* Account Routes */}
        <Route path="/account" element={<AccountLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
