import {
  products as initialProducts,
  orders as initialOrders,
  customers as initialCustomers,
  discounts as initialDiscounts,
  storeSettings as initialSettings,
  type Product,
  type Order,
  type Customer,
  type Discount,
  type StoreSettings,
  type Address,
} from "./mock-data";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type Result<T = void> = { success: true; data: T } | { success: false; error: string };

// ---------------------------------------------------------------------------
// Singleton store — deep-cloned from initial data, shared across API routes
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Deterministic timestamps — use dateOverride when set (seeded episodes)
// ---------------------------------------------------------------------------

let _dateOverride: string | null = null;
let _dateCounter = 0;

export function setDateOverride(date: string | null): void {
  _dateOverride = date;
  _dateCounter = 0;
}

function now(): string {
  if (_dateOverride) {
    const base = new Date(_dateOverride);
    base.setSeconds(base.getSeconds() + _dateCounter++);
    return base.toISOString();
  }
  return new Date().toISOString();
}

function today(): string {
  return now().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Enum validators
// ---------------------------------------------------------------------------

const VALID_PRODUCT_STATUS = new Set<string>(["active", "draft", "archived"]);
const VALID_DISCOUNT_TYPE = new Set<string>(["code", "automatic"]);
const VALID_DISCOUNT_VALUE_TYPE = new Set<string>(["percentage", "fixed_amount", "free_shipping"]);
const VALID_DISCOUNT_STATUS = new Set<string>(["active", "expired", "scheduled"]);

let _products: Product[] = deepClone(initialProducts);
let _orders: Order[] = deepClone(initialOrders);
let _customers: Customer[] = deepClone(initialCustomers);
let _discounts: Discount[] = deepClone(initialDiscounts);
let _settings: StoreSettings = deepClone(initialSettings);
let _nextProductId = 13;
let _nextOrderId = 11; // eslint-disable-line @typescript-eslint/no-unused-vars
let _nextCustomerId = 11;
let _nextDiscountId = 7;
let _nextTimelineId = 18;

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function getProducts(): Product[] {
  return _products;
}

export function getProductById(id: string): Product | undefined {
  return _products.find((p) => p.id === id);
}

export function createProduct(fields: {
  title?: string;
  description?: string;
  status?: Product["status"];
  inventory?: number;
  price?: string;
  compareAtPrice?: string;
  vendor?: string;
  type?: string;
  tags?: string[];
  images?: string[];
}): Result<Product> {
  if (!fields.title || String(fields.title).trim() === "") {
    return { success: false, error: "Title is required" };
  }
  if (fields.inventory !== undefined && (typeof fields.inventory !== "number" || !isFinite(fields.inventory))) {
    return { success: false, error: "Inventory must be a finite number" };
  }
  if (fields.status !== undefined && !VALID_PRODUCT_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` };
  }
  const product: Product = {
    id: String(_nextProductId++),
    title: fields.title.trim(),
    description: fields.description ?? "",
    status: fields.status ?? "draft",
    inventory: fields.inventory ?? 0,
    price: fields.price ?? "0.00",
    compareAtPrice: fields.compareAtPrice,
    vendor: fields.vendor ?? "",
    type: fields.type ?? "",
    tags: fields.tags ?? [],
    images: fields.images ?? [],
    createdAt: today(),
  };
  _products.push(product);
  return { success: true, data: product };
}

export function updateProduct(
  id: string,
  fields: {
    title?: string;
    description?: string;
    status?: Product["status"];
    inventory?: number;
    price?: string;
    compareAtPrice?: string;
    vendor?: string;
    type?: string;
    tags?: string[];
    images?: string[];
  },
): Result<Product> {
  const product = _products.find((p) => p.id === id);
  if (!product) return { success: false, error: "Product not found" };

  if (fields.title !== undefined) {
    if (String(fields.title).trim() === "") {
      return { success: false, error: "Title cannot be empty" };
    }
    product.title = fields.title;
  }
  if (fields.description !== undefined) product.description = fields.description;
  if (fields.status !== undefined) {
    if (!VALID_PRODUCT_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` };
    }
    product.status = fields.status;
  }
  if (fields.inventory !== undefined) {
    if (typeof fields.inventory !== "number" || !isFinite(fields.inventory)) {
      return { success: false, error: "Inventory must be a finite number" };
    }
    product.inventory = fields.inventory;
  }
  if (fields.price !== undefined) product.price = fields.price;
  if (fields.compareAtPrice !== undefined) product.compareAtPrice = fields.compareAtPrice;
  if (fields.vendor !== undefined) product.vendor = fields.vendor;
  if (fields.type !== undefined) product.type = fields.type;
  if (fields.tags !== undefined) product.tags = fields.tags;
  if (fields.images !== undefined) product.images = fields.images;

  return { success: true, data: product };
}

export function deleteProduct(id: string): Result {
  const idx = _products.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: "Product not found" };
  _products.splice(idx, 1);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export function getOrders(): Order[] {
  return _orders;
}

export function getOrderById(id: string): Order | undefined {
  return _orders.find((o) => o.id === id);
}

export function fulfillOrder(id: string): Result<Order> {
  const order = _orders.find((o) => o.id === id);
  if (!order) return { success: false, error: "Order not found" };
  if (order.fulfillmentStatus === "fulfilled") {
    return { success: false, error: "Order already fulfilled" };
  }
  if (order.paymentStatus === "pending") {
    return { success: false, error: "Cannot fulfill order with pending payment" };
  }
  order.fulfillmentStatus = "fulfilled";
  order.timeline.push({
    id: `t${_nextTimelineId++}`,
    message: "Order fulfilled",
    date: now(),
    type: "system",
  });
  return { success: true, data: order };
}

export function capturePayment(id: string): Result<Order> {
  const order = _orders.find((o) => o.id === id);
  if (!order) return { success: false, error: "Order not found" };
  if (order.paymentStatus !== "pending") {
    return { success: false, error: "Payment is not pending" };
  }
  order.paymentStatus = "paid";
  order.timeline.push({
    id: `t${_nextTimelineId++}`,
    message: `Payment captured — $${order.total}`,
    date: now(),
    type: "system",
  });
  return { success: true, data: order };
}

export function refundOrder(id: string): Result<Order> {
  const order = _orders.find((o) => o.id === id);
  if (!order) return { success: false, error: "Order not found" };
  if (order.paymentStatus !== "paid") {
    return { success: false, error: "Order is not paid" };
  }
  order.paymentStatus = "refunded";
  order.timeline.push({
    id: `t${_nextTimelineId++}`,
    message: `Refund issued — $${order.total}`,
    date: now(),
    type: "system",
  });
  return { success: true, data: order };
}

export function addOrderNote(id: string, message: string): Result<Order> {
  const order = _orders.find((o) => o.id === id);
  if (!order) return { success: false, error: "Order not found" };
  if (!message.trim()) return { success: false, error: "Note cannot be empty" };
  order.timeline.push({
    id: `t${_nextTimelineId++}`,
    message: message.trim(),
    date: now(),
    type: "comment",
  });
  return { success: true, data: order };
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export function getCustomers(): Customer[] {
  return _customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return _customers.find((c) => c.id === id);
}

export function createCustomer(fields: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: Address;
  tags?: string[];
  notes?: string;
}): Result<Customer> {
  if (!fields.firstName || !fields.lastName || !fields.email) {
    return { success: false, error: "First name, last name, and email are required" };
  }
  const customer: Customer = {
    id: String(_nextCustomerId++),
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
    name: `${fields.firstName.trim()} ${fields.lastName.trim()}`,
    email: fields.email.trim(),
    phone: fields.phone ?? "",
    orders: 0,
    totalSpent: "0.00",
    location: fields.location ?? "",
    address: fields.address ?? {
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      address1: "",
      city: "",
      province: "",
      country: "",
      zip: "",
    },
    tags: fields.tags ?? [],
    notes: fields.notes ?? "",
    createdAt: today(),
  };
  _customers.push(customer);
  return { success: true, data: customer };
}

export function updateCustomer(
  id: string,
  fields: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    address?: Address;
    tags?: string[];
    notes?: string;
  },
): Result<Customer> {
  const customer = _customers.find((c) => c.id === id);
  if (!customer) return { success: false, error: "Customer not found" };

  if (fields.firstName !== undefined) customer.firstName = fields.firstName;
  if (fields.lastName !== undefined) customer.lastName = fields.lastName;
  if (fields.firstName !== undefined || fields.lastName !== undefined) {
    customer.name = `${customer.firstName} ${customer.lastName}`.trim();
  }
  if (fields.email !== undefined) customer.email = fields.email;
  if (fields.phone !== undefined) customer.phone = fields.phone;
  if (fields.address !== undefined) customer.address = fields.address;
  if (fields.tags !== undefined) customer.tags = fields.tags;
  if (fields.notes !== undefined) customer.notes = fields.notes;
  if (fields.location !== undefined) customer.location = fields.location;

  return { success: true, data: customer };
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------

export function getDiscounts(): Discount[] {
  return _discounts;
}

export function getDiscountById(id: string): Discount | undefined {
  return _discounts.find((d) => d.id === id);
}

export function createDiscount(fields: {
  title?: string;
  code?: string;
  type?: Discount["type"];
  valueType?: Discount["valueType"];
  value?: string;
  status?: Discount["status"];
  usageLimit?: number;
  startsAt?: string;
  endsAt?: string;
}): Result<Discount> {
  if (!fields.title || fields.title.trim() === "") {
    return { success: false, error: "Title is required" };
  }
  if (!fields.type) {
    return { success: false, error: "Discount type is required" };
  }
  if (!VALID_DISCOUNT_TYPE.has(fields.type)) {
    return { success: false, error: `Invalid discount type: ${fields.type}` };
  }
  if (fields.valueType && !VALID_DISCOUNT_VALUE_TYPE.has(fields.valueType)) {
    return { success: false, error: `Invalid value type: ${fields.valueType}` };
  }
  if (fields.status && !VALID_DISCOUNT_STATUS.has(fields.status)) {
    return { success: false, error: `Invalid status: ${fields.status}` };
  }
  const discount: Discount = {
    id: String(_nextDiscountId++),
    title: fields.title.trim(),
    code: fields.code,
    type: fields.type,
    valueType: fields.valueType ?? "percentage",
    value: fields.value ?? "0",
    status: fields.status ?? "active",
    usageCount: 0,
    usageLimit: fields.usageLimit,
    startsAt: fields.startsAt ?? today(),
    endsAt: fields.endsAt,
    createdAt: today(),
  };
  _discounts.push(discount);
  return { success: true, data: discount };
}

export function updateDiscount(
  id: string,
  fields: {
    title?: string;
    code?: string;
    type?: Discount["type"];
    valueType?: Discount["valueType"];
    value?: string;
    status?: Discount["status"];
    usageLimit?: number;
    startsAt?: string;
    endsAt?: string;
  },
): Result<Discount> {
  const discount = _discounts.find((d) => d.id === id);
  if (!discount) return { success: false, error: "Discount not found" };

  if (fields.title !== undefined) discount.title = fields.title;
  if (fields.code !== undefined) discount.code = fields.code;
  if (fields.type !== undefined) {
    if (!VALID_DISCOUNT_TYPE.has(fields.type)) {
      return { success: false, error: `Invalid discount type: ${fields.type}` };
    }
    discount.type = fields.type;
  }
  if (fields.valueType !== undefined) {
    if (!VALID_DISCOUNT_VALUE_TYPE.has(fields.valueType)) {
      return { success: false, error: `Invalid value type: ${fields.valueType}` };
    }
    discount.valueType = fields.valueType;
  }
  if (fields.value !== undefined) discount.value = fields.value;
  if (fields.status !== undefined) {
    if (!VALID_DISCOUNT_STATUS.has(fields.status)) {
      return { success: false, error: `Invalid status: ${fields.status}` };
    }
    if (discount.status === "expired" && fields.status === "active") {
      return { success: false, error: "Cannot reactivate an expired discount" };
    }
    discount.status = fields.status;
  }
  if (fields.usageLimit !== undefined) discount.usageLimit = fields.usageLimit;
  if (fields.startsAt !== undefined) discount.startsAt = fields.startsAt;
  if (fields.endsAt !== undefined) discount.endsAt = fields.endsAt;

  return { success: true, data: discount };
}

export function deleteDiscount(id: string): Result {
  const idx = _discounts.findIndex((d) => d.id === id);
  if (idx === -1) return { success: false, error: "Discount not found" };
  _discounts.splice(idx, 1);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettings(): StoreSettings {
  return _settings;
}

export function updateSettings(fields: Partial<StoreSettings>): Result<StoreSettings> {
  if (fields.storeName !== undefined) _settings.storeName = fields.storeName;
  if (fields.email !== undefined) _settings.email = fields.email;
  if (fields.phone !== undefined) _settings.phone = fields.phone;
  if (fields.currency !== undefined) _settings.currency = fields.currency;
  if (fields.timezone !== undefined) _settings.timezone = fields.timezone;
  if (fields.address !== undefined) _settings.address = fields.address;
  if (fields.weightUnit !== undefined) _settings.weightUnit = fields.weightUnit;
  if (fields.shippingRates !== undefined) _settings.shippingRates = fields.shippingRates;

  return { success: true, data: _settings };
}

// ---------------------------------------------------------------------------
// Reset — restores everything to initial state
// ---------------------------------------------------------------------------

export function reset(seed?: number): void {
  _products = deepClone(initialProducts);
  _orders = deepClone(initialOrders);
  _customers = deepClone(initialCustomers);
  _discounts = deepClone(initialDiscounts);
  _settings = deepClone(initialSettings);
  _nextProductId = 13;
  _nextOrderId = 11;
  _nextCustomerId = 11;
  _nextDiscountId = 7;
  _nextTimelineId = 18;

  // Deterministic timestamps when seed is provided
  if (seed !== undefined) {
    const base = new Date("2025-06-01T12:00:00.000Z");
    base.setMinutes(base.getMinutes() + (seed % 1440));
    _dateOverride = base.toISOString();
  } else {
    _dateOverride = null;
  }
  _dateCounter = 0;
}
