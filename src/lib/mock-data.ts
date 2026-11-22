// ── Images (Unsplash) ──
const img = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// ── Categories ──
export const categories = [
  {
    id: "1",
    name: "Electronics",
    icon: "📱",
    image: img("photo-1498049794561-7780e7231661", 400, 400),
    count: 2450,
  },
  {
    id: "2",
    name: "Fashion",
    icon: "👗",
    image: img("photo-1445205170230-053b83016050", 400, 400),
    count: 5820,
  },
  {
    id: "3",
    name: "Home & Living",
    icon: "🏠",
    image: img("photo-1556909114-f6e7ad7d3136", 400, 400),
    count: 3100,
  },
  {
    id: "4",
    name: "Beauty",
    icon: "💄",
    image: img("photo-1596462502278-27bfdc403348", 400, 400),
    count: 1890,
  },
  {
    id: "5",
    name: "Sports",
    icon: "⚽",
    image: img("photo-1461896836934-bd45ba8e3932", 400, 400),
    count: 920,
  },
  {
    id: "6",
    name: "Books",
    icon: "📚",
    image: img("photo-1512820790803-83ca734da794", 400, 400),
    count: 4200,
  },
  {
    id: "7",
    name: "Toys & Games",
    icon: "🧸",
    image: img("photo-1558060370-d644479cb6f7", 400, 400),
    count: 760,
  },
  {
    id: "8",
    name: "Grocery",
    icon: "🛒",
    image: img("photo-1542838132-92c53300491e", 400, 400),
    count: 3400,
  },
];

// ── Products ──
export interface Product {
  id: string;
  title: string;
  brand: string;
  productPrice: number;
  price: number; // alias for productPrice (used by detail pages)
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  category: string;
  badge?: string;
  inStock: boolean;
  freeDelivery: boolean;
  description: string;
  specifications: Record<string, string>;
  seller: string;
  colors?: string[];
  sizes?: string[];
}

// ── Reviews ──
export interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export const reviews: Review[] = [
  {
    id: "r1",
    userName: "Priya S.",
    rating: 5,
    title: "Absolutely love it!",
    comment:
      "Best purchase I've made this year. Sound quality is incredible and battery lasts forever.",
    date: "2 days ago",
    helpful: 142,
    verified: true,
  },
  {
    id: "r2",
    userName: "Rahul M.",
    rating: 4,
    title: "Great value for money",
    comment: "Very comfortable and good noise cancellation. Could improve the carrying case.",
    date: "1 week ago",
    helpful: 89,
    verified: true,
  },
  {
    id: "r3",
    userName: "Anita K.",
    rating: 5,
    title: "Premium quality!",
    comment: "Feels very premium. The build quality is excellent and fits perfectly.",
    date: "3 days ago",
    helpful: 67,
    verified: true,
  },
  {
    id: "r4",
    userName: "Vikram P.",
    rating: 3,
    title: "Decent product",
    comment:
      "Good for the price but not as good as the premium alternatives. Works fine for casual use.",
    date: "2 weeks ago",
    helpful: 34,
    verified: false,
  },
  {
    id: "r5",
    userName: "Sneha R.",
    rating: 5,
    title: "Exceeded expectations",
    comment: "Was skeptical at first but this product has won me over. Highly recommend!",
    date: "5 days ago",
    helpful: 203,
    verified: true,
  },
];
// ── Mock Addresses ──
export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: "Home" | "Work" | "Other";
  isDefault: boolean;
}

export const mockAddresses: Address[] = [
  {
    id: "a1",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    line1: "42, MG Road, Sector 14",
    line2: "Near City Mall",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    type: "Home",
    isDefault: true,
  },
  {
    id: "a2",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    line1: "Tower B, 5th Floor, Cyber Hub",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    type: "Work",
    isDefault: false,
  },
  {
    id: "a3",
    name: "Priya Sharma",
    phone: "+91 91234 56789",
    line1: "A-12, Green Park Extension",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110016",
    type: "Home",
    isDefault: false,
  },
];

// ── Mock Orders ──
export interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  items: { productId: string; title: string; image: string; productPrice: number; quantity: number }[];
  trackingId?: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-2026-8842",
    date: "2026-05-02",
    status: "Delivered",
    total: 12999,
    items: [
      {
        productId: "1",
        title: "Wireless Noise-Cancelling Headphones",
        image: img("photo-1505740420928-5e560c06d30e", 100, 100),
        productPrice : 4999,
        quantity: 1,
      },
      {
        productId: "3",
        title: "Smart Fitness Band Pro",
        image: img("photo-1575311373937-040b8e1fd5b6", 100, 100),
        productPrice: 7999,
        quantity: 1,
      },
    ],
    trackingId: "DELHUB2026050245",
  },
  {
    id: "ORD-2026-7631",
    date: "2026-04-25",
    status: "Shipped",
    total: 2499,
    items: [
      {
        productId: "5",
        title: "Premium Cotton T-Shirt",
        image: img("photo-1521572163474-6864f9cf17ab", 100, 100),
        productPrice: 799,
        quantity: 2,
      },
    ],
    trackingId: "MUMBEX2026042598",
  },
  {
    id: "ORD-2026-6120",
    date: "2026-04-10",
    status: "Processing",
    total: 34999,
    items: [
      {
        productId: "2",
        title: 'Ultra HD 4K Smart TV 55"',
        image: img("photo-1593359677879-a4bb92f829d1", 100, 100),
        productPrice: 34999,
        quantity: 1,
      },
    ],
  },
  {
    id: "ORD-2026-5001",
    date: "2026-03-15",
    status: "Cancelled",
    total: 1299,
    items: [
      {
        productId: "8",
        title: "Yoga Mat Premium",
        image: img("photo-1601925260368-ae2f83cf8b7f", 100, 100),
        productPrice: 1299,
        quantity: 1,
      },
    ],
  },
];

// ── Mock Returns ──
export interface ReturnRequest {
  id: string;
  orderId: string;
  productTitle: string;
  image: string;
  reason: string;
  status: "Initiated" | "Picked Up" | "Refund Processing" | "Refunded";
  date: string;
  refundAmount: number;
}

export const mockReturns: ReturnRequest[] = [
  {
    id: "RET-001",
    orderId: "ORD-2026-8842",
    productTitle: "Wireless Noise-Cancelling Headphones",
    image: img("photo-1505740420928-5e560c06d30e", 100, 100),
    reason: "Defective product",
    status: "Refunded",
    date: "2026-05-05",
    refundAmount: 4999,
  },
  {
    id: "RET-002",
    orderId: "ORD-2026-7631",
    productTitle: "Premium Cotton T-Shirt",
    image: img("photo-1521572163474-6864f9cf17ab", 100, 100),
    reason: "Wrong size",
    status: "Picked Up",
    date: "2026-04-28",
    refundAmount: 799,
  },
];

// ── Banner slides ──
export const bannerSlides = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    subtitle: "Up to 60% off on top brands",
    cta: "Shop Now",
    bg: "from-primary to-secondary",
    image: img("photo-1468495244123-6c6c332d0b80", 1200, 500),
  },
  {
    id: 2,
    title: "Fashion Fiesta",
    subtitle: "New arrivals starting ₹499",
    cta: "Explore",
    bg: "from-secondary to-accent",
    image: img("photo-1483985988355-763728e1935b", 1200, 500),
  },
  {
    id: 3,
    title: "Home Makeover",
    subtitle: "Flat 40% off on home essentials",
    cta: "Discover",
    bg: "from-accent to-primary",
    image: img("photo-1556909114-f6e7ad7d3136", 1200, 500),
  },
];

// ── Helpers ──
export const formatPrice = (price?: number) => {
  if (price == null) return "₹0";
  return `₹${price.toLocaleString("en-IN")}`;
};

/**
 * Normalize a raw API product into our Product interface.
 * Maps backend field names (productName, productPrice, productImage, etc.)
 * to the frontend field names used throughout the app.
 */
export function mapApiProduct(item: any): Product {
  return {
    id: String(item.id),
    title: item.productName || item.title || "",
    brand: item.brand || "Generic",
    productPrice: Number(item.productPrice ?? item.price ?? 0),
    price: Number(item.productPrice ?? item.price ?? 0),
    originalPrice: Number(item.originalPrice ?? item.productPrice ?? item.price ?? 0),
    discount: Number(item.discount ?? 0),
    rating: Number(item.productRating ?? item.rating ?? 0),
    reviewCount: Number(item.reviewCount ?? 0),
    image: item.productImage || item.image || "",
    images: item.images || (item.productImage ? [item.productImage] : (item.image ? [item.image] : [])),
    category: String(item.category ?? ""),
    badge: item.badge || undefined,
    inStock: item.inStock ?? true,
    freeDelivery: item.freeDelivery ?? false,
    description: item.description || item.productDescription || "",
    specifications: item.specifications || {},
    seller: item.seller || "",
    colors: item.colors || undefined,
    sizes: item.sizes || undefined,
  };
}
