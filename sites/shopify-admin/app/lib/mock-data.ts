// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Product {
  [key: string]: unknown;
  id: string;
  title: string;
  description: string;
  status: "active" | "draft" | "archived";
  inventory: number;
  price: string;
  compareAtPrice?: string;
  vendor: string;
  type: string;
  tags: string[];
  images: string[];
  createdAt: string;
}

export interface OrderLineItem {
  productId: string;
  title: string;
  quantity: number;
  price: string;
}

export interface TimelineEntry {
  id: string;
  message: string;
  date: string;
  type: "system" | "comment";
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface Order {
  [key: string]: unknown;
  id: string;
  orderNumber: string;
  customerId: string;
  customer: string;
  email: string;
  date: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  paymentStatus: "paid" | "pending" | "refunded";
  fulfillmentStatus: "fulfilled" | "unfulfilled" | "partial";
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  notes: string;
  tags: string[];
  timeline: TimelineEntry[];
}

export interface Customer {
  [key: string]: unknown;
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: string;
  location: string;
  address: Address;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface Discount {
  [key: string]: unknown;
  id: string;
  title: string;
  code?: string;
  type: "code" | "automatic";
  valueType: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  status: "active" | "expired" | "scheduled";
  usageCount: number;
  usageLimit?: number;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  email: string;
  phone: string;
  currency: string;
  timezone: string;
  address: Address;
  weightUnit: "kg" | "lb";
  shippingRates: { name: string; price: string; minOrderTotal?: string }[];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const products: Product[] = [
  {
    id: "1",
    title: "Classic Cotton T-Shirt",
    description:
      "A comfortable everyday tee made from 100% organic cotton. Pre-shrunk and available in multiple colors.",
    status: "active",
    inventory: 245,
    price: "29.99",
    vendor: "ThreadCo",
    type: "T-Shirts",
    tags: ["cotton", "basics", "summer"],
    images: [],
    createdAt: "2025-11-15",
  },
  {
    id: "2",
    title: "Slim Fit Jeans",
    description:
      "Modern slim fit jeans with stretch denim for all-day comfort. Classic five-pocket styling.",
    status: "active",
    inventory: 128,
    price: "59.99",
    vendor: "DenimWorks",
    type: "Pants",
    tags: ["denim", "casual"],
    images: [],
    createdAt: "2025-10-22",
  },
  {
    id: "3",
    title: "Wool Blend Sweater",
    description:
      "Warm wool blend sweater with ribbed cuffs and hem. Perfect for layering in cooler months.",
    status: "active",
    inventory: 67,
    price: "79.99",
    vendor: "KnitHouse",
    type: "Sweaters",
    tags: ["wool", "winter", "knitwear"],
    images: [],
    createdAt: "2025-12-01",
  },
  {
    id: "4",
    title: "Running Sneakers Pro",
    description:
      "Lightweight performance running shoes with responsive cushioning and breathable mesh upper.",
    status: "active",
    inventory: 312,
    price: "119.99",
    vendor: "StepForward",
    type: "Footwear",
    tags: ["running", "athletic", "shoes"],
    images: [],
    createdAt: "2025-09-18",
  },
  {
    id: "5",
    title: "Leather Weekend Bag",
    description:
      "Full-grain leather weekend bag with brass hardware. Spacious main compartment with interior pockets.",
    status: "active",
    inventory: 43,
    price: "199.99",
    vendor: "BagCraft",
    type: "Accessories",
    tags: ["leather", "travel", "premium"],
    images: [],
    createdAt: "2025-08-30",
  },
  {
    id: "6",
    title: "Organic Linen Shirt",
    description: "Lightweight organic linen shirt. Relaxed fit with mother-of-pearl buttons.",
    status: "draft",
    inventory: 0,
    price: "45.99",
    vendor: "ThreadCo",
    type: "Shirts",
    tags: ["linen", "organic", "summer"],
    images: [],
    createdAt: "2026-01-10",
  },
  {
    id: "7",
    title: "Canvas Backpack",
    description:
      "Durable waxed canvas backpack with padded laptop sleeve. Water-resistant exterior.",
    status: "active",
    inventory: 89,
    price: "69.99",
    vendor: "BagCraft",
    type: "Accessories",
    tags: ["canvas", "backpack", "everyday"],
    images: [],
    createdAt: "2025-11-28",
  },
  {
    id: "8",
    title: "Merino Wool Socks (3-Pack)",
    description:
      "Premium merino wool socks with moisture-wicking properties. Reinforced heel and toe.",
    status: "active",
    inventory: 534,
    price: "24.99",
    vendor: "KnitHouse",
    type: "Accessories",
    tags: ["merino", "socks", "basics"],
    images: [],
    createdAt: "2025-12-15",
  },
  {
    id: "9",
    title: "Waterproof Hiking Jacket",
    description:
      "Three-layer waterproof jacket with sealed seams. Adjustable hood and pit zips for ventilation.",
    status: "active",
    inventory: 76,
    price: "149.99",
    vendor: "TrailGear",
    type: "Outerwear",
    tags: ["waterproof", "hiking", "outdoor"],
    images: [],
    createdAt: "2025-10-05",
  },
  {
    id: "10",
    title: "Summer Floral Dress",
    description:
      "Light and breezy floral print dress. A-line silhouette with adjustable shoulder straps.",
    status: "archived",
    inventory: 12,
    price: "54.99",
    vendor: "ThreadCo",
    type: "Dresses",
    tags: ["floral", "summer", "dress"],
    images: [],
    createdAt: "2025-06-20",
  },
  {
    id: "11",
    title: "Stretch Chino Shorts",
    description: "Comfortable stretch chino shorts with a 9-inch inseam. Perfect for warm weather.",
    status: "draft",
    inventory: 0,
    price: "39.99",
    vendor: "DenimWorks",
    type: "Pants",
    tags: ["chino", "shorts", "summer"],
    images: [],
    createdAt: "2026-02-01",
  },
  {
    id: "12",
    title: "Polarized Sunglasses",
    description:
      "Classic wayfarer-style polarized sunglasses with UV400 protection. Acetate frames.",
    status: "active",
    inventory: 156,
    price: "34.99",
    vendor: "ShadeVault",
    type: "Accessories",
    tags: ["sunglasses", "polarized", "summer"],
    images: [],
    createdAt: "2025-07-14",
  },
];

export const orders: Order[] = [
  {
    id: "1",
    orderNumber: "#1042",
    customerId: "1",
    customer: "Emma Johnson",
    email: "emma.j@example.com",
    date: "2026-03-31",
    total: "149.97",
    subtotal: "139.97",
    tax: "5.00",
    shipping: "5.00",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    lineItems: [
      { productId: "1", title: "Classic Cotton T-Shirt", quantity: 2, price: "29.99" },
      { productId: "3", title: "Wool Blend Sweater", quantity: 1, price: "79.99" },
    ],
    shippingAddress: {
      firstName: "Emma",
      lastName: "Johnson",
      address1: "123 Main St",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10001",
    },
    notes: "",
    tags: [],
    timeline: [{ id: "t1", message: "Order placed", date: "2026-03-31T14:23:00Z", type: "system" }],
  },
  {
    id: "2",
    orderNumber: "#1041",
    customerId: "2",
    customer: "Liam Chen",
    email: "liam.c@example.com",
    date: "2026-03-31",
    total: "279.98",
    subtotal: "269.98",
    tax: "10.00",
    shipping: "0.00",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    lineItems: [
      { productId: "4", title: "Running Sneakers Pro", quantity: 1, price: "119.99" },
      { productId: "9", title: "Waterproof Hiking Jacket", quantity: 1, price: "149.99" },
    ],
    shippingAddress: {
      firstName: "Liam",
      lastName: "Chen",
      address1: "456 Market St",
      city: "San Francisco",
      province: "CA",
      country: "US",
      zip: "94102",
    },
    notes: "Customer requested gift wrapping",
    tags: ["gift"],
    timeline: [{ id: "t2", message: "Order placed", date: "2026-03-31T12:05:00Z", type: "system" }],
  },
  {
    id: "3",
    orderNumber: "#1040",
    customerId: "3",
    customer: "Sofia Martinez",
    email: "sofia.m@example.com",
    date: "2026-03-30",
    total: "84.99",
    subtotal: "79.99",
    tax: "5.00",
    shipping: "0.00",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    lineItems: [{ productId: "3", title: "Wool Blend Sweater", quantity: 1, price: "79.99" }],
    shippingAddress: {
      firstName: "Sofia",
      lastName: "Martinez",
      address1: "789 Congress Ave",
      city: "Austin",
      province: "TX",
      country: "US",
      zip: "78701",
    },
    notes: "",
    tags: [],
    timeline: [
      { id: "t3", message: "Order placed", date: "2026-03-30T09:15:00Z", type: "system" },
      { id: "t4", message: "Order fulfilled", date: "2026-03-30T16:00:00Z", type: "system" },
    ],
  },
  {
    id: "4",
    orderNumber: "#1039",
    customerId: "4",
    customer: "Noah Williams",
    email: "noah.w@example.com",
    date: "2026-03-30",
    total: "189.98",
    subtotal: "179.98",
    tax: "5.00",
    shipping: "5.00",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    lineItems: [
      { productId: "2", title: "Slim Fit Jeans", quantity: 1, price: "59.99" },
      { productId: "4", title: "Running Sneakers Pro", quantity: 1, price: "119.99" },
    ],
    shippingAddress: {
      firstName: "Noah",
      lastName: "Williams",
      address1: "321 Michigan Ave",
      city: "Chicago",
      province: "IL",
      country: "US",
      zip: "60601",
    },
    notes: "Payment authorized, awaiting capture",
    tags: ["pending-payment"],
    timeline: [{ id: "t5", message: "Order placed", date: "2026-03-30T08:30:00Z", type: "system" }],
  },
  {
    id: "5",
    orderNumber: "#1038",
    customerId: "5",
    customer: "Ava Thompson",
    email: "ava.t@example.com",
    date: "2026-03-29",
    total: "119.99",
    subtotal: "119.99",
    tax: "0.00",
    shipping: "0.00",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    lineItems: [{ productId: "4", title: "Running Sneakers Pro", quantity: 1, price: "119.99" }],
    shippingAddress: {
      firstName: "Ava",
      lastName: "Thompson",
      address1: "55 Baker St",
      city: "London",
      province: "",
      country: "UK",
      zip: "W1U 8EW",
    },
    notes: "",
    tags: ["international"],
    timeline: [
      { id: "t6", message: "Order placed", date: "2026-03-29T11:00:00Z", type: "system" },
      { id: "t7", message: "Order fulfilled", date: "2026-03-29T17:30:00Z", type: "system" },
    ],
  },
  {
    id: "6",
    orderNumber: "#1037",
    customerId: "6",
    customer: "James Rodriguez",
    email: "james.r@example.com",
    date: "2026-03-29",
    total: "94.98",
    subtotal: "89.98",
    tax: "5.00",
    shipping: "0.00",
    paymentStatus: "paid",
    fulfillmentStatus: "partial",
    lineItems: [
      { productId: "1", title: "Classic Cotton T-Shirt", quantity: 1, price: "29.99" },
      { productId: "2", title: "Slim Fit Jeans", quantity: 1, price: "59.99" },
    ],
    shippingAddress: {
      firstName: "James",
      lastName: "Rodriguez",
      address1: "100 Biscayne Blvd",
      city: "Miami",
      province: "FL",
      country: "US",
      zip: "33132",
    },
    notes: "T-Shirt shipped, Jeans backordered",
    tags: ["partial-ship"],
    timeline: [
      { id: "t8", message: "Order placed", date: "2026-03-29T10:00:00Z", type: "system" },
      {
        id: "t9",
        message: "Partially fulfilled - 1 of 2 items shipped",
        date: "2026-03-29T15:00:00Z",
        type: "system",
      },
    ],
  },
  {
    id: "7",
    orderNumber: "#1036",
    customerId: "7",
    customer: "Mia Davis",
    email: "mia.d@example.com",
    date: "2026-03-28",
    total: "364.98",
    subtotal: "349.98",
    tax: "15.00",
    shipping: "0.00",
    paymentStatus: "refunded",
    fulfillmentStatus: "fulfilled",
    lineItems: [
      { productId: "5", title: "Leather Weekend Bag", quantity: 1, price: "199.99" },
      { productId: "9", title: "Waterproof Hiking Jacket", quantity: 1, price: "149.99" },
    ],
    shippingAddress: {
      firstName: "Mia",
      lastName: "Davis",
      address1: "200 Queen St W",
      city: "Toronto",
      province: "ON",
      country: "CA",
      zip: "M5V 3K1",
    },
    notes: "Customer requested refund - items returned",
    tags: ["return", "refunded"],
    timeline: [
      { id: "t10", message: "Order placed", date: "2026-03-28T09:00:00Z", type: "system" },
      { id: "t11", message: "Order fulfilled", date: "2026-03-28T14:00:00Z", type: "system" },
      {
        id: "t12",
        message: "Refund issued - $364.98",
        date: "2026-03-29T10:00:00Z",
        type: "system",
      },
    ],
  },
  {
    id: "8",
    orderNumber: "#1035",
    customerId: "8",
    customer: "Oliver Brown",
    email: "oliver.b@example.com",
    date: "2026-03-28",
    total: "59.99",
    subtotal: "54.99",
    tax: "5.00",
    shipping: "0.00",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    lineItems: [{ productId: "2", title: "Slim Fit Jeans", quantity: 1, price: "59.99" }],
    shippingAddress: {
      firstName: "Oliver",
      lastName: "Brown",
      address1: "500 Pine St",
      city: "Seattle",
      province: "WA",
      country: "US",
      zip: "98101",
    },
    notes: "",
    tags: [],
    timeline: [
      { id: "t13", message: "Order placed", date: "2026-03-28T07:45:00Z", type: "system" },
      { id: "t14", message: "Order fulfilled", date: "2026-03-28T16:00:00Z", type: "system" },
    ],
  },
  {
    id: "9",
    orderNumber: "#1034",
    customerId: "9",
    customer: "Isabella Wilson",
    email: "isabella.w@example.com",
    date: "2026-03-27",
    total: "209.96",
    subtotal: "199.96",
    tax: "5.00",
    shipping: "5.00",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    lineItems: [
      { productId: "7", title: "Canvas Backpack", quantity: 1, price: "69.99" },
      { productId: "8", title: "Merino Wool Socks (3-Pack)", quantity: 2, price: "24.99" },
      { productId: "3", title: "Wool Blend Sweater", quantity: 1, price: "79.99" },
    ],
    shippingAddress: {
      firstName: "Isabella",
      lastName: "Wilson",
      address1: "777 Burnside St",
      city: "Portland",
      province: "OR",
      country: "US",
      zip: "97209",
    },
    notes: "",
    tags: [],
    timeline: [
      { id: "t15", message: "Order placed", date: "2026-03-27T13:20:00Z", type: "system" },
      { id: "t16", message: "Order fulfilled", date: "2026-03-27T18:00:00Z", type: "system" },
    ],
  },
  {
    id: "10",
    orderNumber: "#1033",
    customerId: "10",
    customer: "William Taylor",
    email: "william.t@example.com",
    date: "2026-03-27",
    total: "149.99",
    subtotal: "144.99",
    tax: "5.00",
    shipping: "0.00",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    lineItems: [
      { productId: "9", title: "Waterproof Hiking Jacket", quantity: 1, price: "149.99" },
    ],
    shippingAddress: {
      firstName: "William",
      lastName: "Taylor",
      address1: "900 Colfax Ave",
      city: "Denver",
      province: "CO",
      country: "US",
      zip: "80203",
    },
    notes: "",
    tags: [],
    timeline: [
      { id: "t17", message: "Order placed", date: "2026-03-27T11:00:00Z", type: "system" },
    ],
  },
];

export const customers: Customer[] = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Johnson",
    name: "Emma Johnson",
    email: "emma.j@example.com",
    phone: "+1 212-555-0101",
    orders: 8,
    totalSpent: "642.91",
    location: "New York, US",
    address: {
      firstName: "Emma",
      lastName: "Johnson",
      address1: "123 Main St",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10001",
    },
    tags: ["vip"],
    notes: "Preferred customer, always orders gift wrapping.",
    createdAt: "2025-03-15",
  },
  {
    id: "2",
    firstName: "Liam",
    lastName: "Chen",
    name: "Liam Chen",
    email: "liam.c@example.com",
    phone: "+1 415-555-0102",
    orders: 12,
    totalSpent: "1,247.83",
    location: "San Francisco, US",
    address: {
      firstName: "Liam",
      lastName: "Chen",
      address1: "456 Market St",
      city: "San Francisco",
      province: "CA",
      country: "US",
      zip: "94102",
    },
    tags: ["vip", "wholesale"],
    notes: "Bulk buyer. Interested in wholesale pricing.",
    createdAt: "2025-01-20",
  },
  {
    id: "3",
    firstName: "Sofia",
    lastName: "Martinez",
    name: "Sofia Martinez",
    email: "sofia.m@example.com",
    phone: "+1 512-555-0103",
    orders: 5,
    totalSpent: "389.95",
    location: "Austin, US",
    address: {
      firstName: "Sofia",
      lastName: "Martinez",
      address1: "789 Congress Ave",
      city: "Austin",
      province: "TX",
      country: "US",
      zip: "78701",
    },
    tags: [],
    notes: "",
    createdAt: "2025-06-10",
  },
  {
    id: "4",
    firstName: "Noah",
    lastName: "Williams",
    name: "Noah Williams",
    email: "noah.w@example.com",
    phone: "+1 312-555-0104",
    orders: 3,
    totalSpent: "274.97",
    location: "Chicago, US",
    address: {
      firstName: "Noah",
      lastName: "Williams",
      address1: "321 Michigan Ave",
      city: "Chicago",
      province: "IL",
      country: "US",
      zip: "60601",
    },
    tags: [],
    notes: "",
    createdAt: "2025-09-02",
  },
  {
    id: "5",
    firstName: "Ava",
    lastName: "Thompson",
    name: "Ava Thompson",
    email: "ava.t@example.com",
    phone: "+44 20-7555-0105",
    orders: 15,
    totalSpent: "1,891.42",
    location: "London, UK",
    address: {
      firstName: "Ava",
      lastName: "Thompson",
      address1: "55 Baker St",
      city: "London",
      province: "",
      country: "UK",
      zip: "W1U 8EW",
    },
    tags: ["vip", "international"],
    notes: "International shipping. Prefers express delivery.",
    createdAt: "2024-11-08",
  },
  {
    id: "6",
    firstName: "James",
    lastName: "Rodriguez",
    name: "James Rodriguez",
    email: "james.r@example.com",
    phone: "+1 305-555-0106",
    orders: 6,
    totalSpent: "523.88",
    location: "Miami, US",
    address: {
      firstName: "James",
      lastName: "Rodriguez",
      address1: "100 Biscayne Blvd",
      city: "Miami",
      province: "FL",
      country: "US",
      zip: "33132",
    },
    tags: [],
    notes: "",
    createdAt: "2025-04-22",
  },
  {
    id: "7",
    firstName: "Mia",
    lastName: "Davis",
    name: "Mia Davis",
    email: "mia.d@example.com",
    phone: "+1 416-555-0107",
    orders: 9,
    totalSpent: "876.54",
    location: "Toronto, CA",
    address: {
      firstName: "Mia",
      lastName: "Davis",
      address1: "200 Queen St W",
      city: "Toronto",
      province: "ON",
      country: "CA",
      zip: "M5V 3K1",
    },
    tags: ["international"],
    notes: "Canadian customer. Aware of duties.",
    createdAt: "2025-02-14",
  },
  {
    id: "8",
    firstName: "Oliver",
    lastName: "Brown",
    name: "Oliver Brown",
    email: "oliver.b@example.com",
    phone: "+1 206-555-0108",
    orders: 2,
    totalSpent: "109.98",
    location: "Seattle, US",
    address: {
      firstName: "Oliver",
      lastName: "Brown",
      address1: "500 Pine St",
      city: "Seattle",
      province: "WA",
      country: "US",
      zip: "98101",
    },
    tags: ["new"],
    notes: "",
    createdAt: "2025-12-01",
  },
  {
    id: "9",
    firstName: "Isabella",
    lastName: "Wilson",
    name: "Isabella Wilson",
    email: "isabella.w@example.com",
    phone: "+1 503-555-0109",
    orders: 7,
    totalSpent: "698.91",
    location: "Portland, US",
    address: {
      firstName: "Isabella",
      lastName: "Wilson",
      address1: "777 Burnside St",
      city: "Portland",
      province: "OR",
      country: "US",
      zip: "97209",
    },
    tags: [],
    notes: "",
    createdAt: "2025-05-30",
  },
  {
    id: "10",
    firstName: "William",
    lastName: "Taylor",
    name: "William Taylor",
    email: "william.t@example.com",
    phone: "+1 720-555-0110",
    orders: 4,
    totalSpent: "459.96",
    location: "Denver, US",
    address: {
      firstName: "William",
      lastName: "Taylor",
      address1: "900 Colfax Ave",
      city: "Denver",
      province: "CO",
      country: "US",
      zip: "80203",
    },
    tags: [],
    notes: "",
    createdAt: "2025-08-17",
  },
];

export const discounts: Discount[] = [
  {
    id: "1",
    title: "Summer Sale 20%",
    code: "SUMMER20",
    type: "code",
    valueType: "percentage",
    value: "20",
    status: "active",
    usageCount: 47,
    usageLimit: 200,
    startsAt: "2026-03-01",
    endsAt: "2026-06-30",
    createdAt: "2026-02-25",
  },
  {
    id: "2",
    title: "Free Shipping Over $100",
    type: "automatic",
    valueType: "free_shipping",
    value: "0",
    status: "active",
    usageCount: 128,
    startsAt: "2026-01-01",
    createdAt: "2025-12-20",
  },
  {
    id: "3",
    title: "Welcome 10% Off",
    code: "WELCOME10",
    type: "code",
    valueType: "percentage",
    value: "10",
    status: "active",
    usageCount: 312,
    startsAt: "2025-06-01",
    createdAt: "2025-05-28",
  },
  {
    id: "4",
    title: "Holiday $15 Off",
    code: "HOLIDAY15",
    type: "code",
    valueType: "fixed_amount",
    value: "15",
    status: "expired",
    usageCount: 89,
    usageLimit: 100,
    startsAt: "2025-12-01",
    endsAt: "2025-12-31",
    createdAt: "2025-11-20",
  },
  {
    id: "5",
    title: "VIP 25% Discount",
    code: "VIP25",
    type: "code",
    valueType: "percentage",
    value: "25",
    status: "active",
    usageCount: 15,
    usageLimit: 50,
    startsAt: "2026-02-01",
    createdAt: "2026-01-28",
  },
  {
    id: "6",
    title: "Flash Sale $10 Off",
    code: "FLASH10",
    type: "code",
    valueType: "fixed_amount",
    value: "10",
    status: "scheduled",
    usageCount: 0,
    usageLimit: 500,
    startsAt: "2026-04-15",
    endsAt: "2026-04-16",
    createdAt: "2026-03-30",
  },
];

export const storeSettings: StoreSettings = {
  storeName: "My Store",
  email: "admin@mystore.com",
  phone: "+1 555-000-0000",
  currency: "USD",
  timezone: "America/New_York",
  address: {
    firstName: "Store",
    lastName: "Admin",
    address1: "100 Commerce St",
    city: "New York",
    province: "NY",
    country: "US",
    zip: "10001",
  },
  weightUnit: "lb",
  shippingRates: [
    { name: "Standard Shipping", price: "5.00" },
    { name: "Express Shipping", price: "15.00" },
    { name: "Free Shipping", price: "0.00", minOrderTotal: "100.00" },
  ],
};

export const dashboardStats = {
  totalSales: "$12,847.32",
  totalOrders: 42,
  onlineStoreSessions: 1_284,
  conversionRate: "3.27%",
  averageOrderValue: "$305.89",
  returningCustomerRate: "38.2%",
};
