import { NextResponse } from "next/server";

const actionSpace = {
  version: "2.0",
  actions: [
    {
      name: "navigate",
      description: "Navigate to a page in the admin",
      params: { target: "string — e.g. /admin/products, /admin/orders/1" },
      reward: 0.0,
      example: { action: "navigate", target: "/admin/products" },
    },
    {
      name: "search",
      description: "Search within the current page",
      params: { page: "string", query: "string" },
      reward: 0.05,
      example: { action: "search", page: "products", query: "cotton" },
    },
    {
      name: "select",
      description: "Select items on the current page",
      params: { ids: "string[]" },
      reward: 0.02,
      example: { action: "select", ids: ["1", "3"] },
    },
    {
      name: "create_product",
      description: "Create a new product",
      params: {
        fields: "{ title, description?, price?, status?, inventory?, vendor?, type?, tags? }",
      },
      reward: 0.5,
      example: {
        action: "create_product",
        fields: { title: "New Shirt", price: "29.99", status: "active" },
      },
    },
    {
      name: "update_product",
      description: "Update an existing product",
      params: {
        productId: "string",
        fields: "{ title?, description?, price?, status?, inventory?, vendor?, type?, tags? }",
      },
      reward: 0.5,
      example: { action: "update_product", productId: "1", fields: { price: "34.99" } },
    },
    {
      name: "delete_product",
      description: "Delete a product",
      params: { productId: "string" },
      reward: 0.3,
      example: { action: "delete_product", productId: "10" },
    },
    {
      name: "fulfill_order",
      description: "Fulfill an unfulfilled order",
      params: { orderId: "string" },
      reward: 1.0,
      example: { action: "fulfill_order", orderId: "1" },
    },
    {
      name: "capture_payment",
      description: "Capture a pending payment",
      params: { orderId: "string" },
      reward: 1.0,
      example: { action: "capture_payment", orderId: "4" },
    },
    {
      name: "refund_order",
      description: "Refund a paid order",
      params: { orderId: "string" },
      reward: 0.8,
      example: { action: "refund_order", orderId: "3" },
    },
    {
      name: "add_order_note",
      description: "Add a note to an order timeline",
      params: { orderId: "string", message: "string" },
      reward: 0.1,
      example: {
        action: "add_order_note",
        orderId: "1",
        message: "Contacted customer about shipping",
      },
    },
    {
      name: "create_customer",
      description: "Create a new customer",
      params: { fields: "{ firstName, lastName, email, phone?, address?, tags?, notes? }" },
      reward: 0.5,
      example: {
        action: "create_customer",
        fields: { firstName: "Jane", lastName: "Doe", email: "jane@example.com" },
      },
    },
    {
      name: "update_customer",
      description: "Update an existing customer",
      params: {
        customerId: "string",
        fields: "{ firstName?, lastName?, email?, phone?, tags?, notes? }",
      },
      reward: 0.3,
      example: {
        action: "update_customer",
        customerId: "1",
        fields: { tags: ["vip", "wholesale"] },
      },
    },
    {
      name: "create_discount",
      description: "Create a new discount",
      params: {
        fields:
          "{ title, type: code|automatic, valueType?: percentage|fixed_amount|free_shipping, value?, code?, startsAt?, endsAt?, usageLimit? }",
      },
      reward: 0.5,
      example: {
        action: "create_discount",
        fields: {
          title: "Spring 15%",
          type: "code",
          code: "SPRING15",
          valueType: "percentage",
          value: "15",
        },
      },
    },
    {
      name: "update_settings",
      description: "Update store settings",
      params: {
        fields: "{ storeName?, email?, phone?, currency?, timezone?, weightUnit?, address? }",
      },
      reward: 0.3,
      example: { action: "update_settings", fields: { storeName: "My Awesome Store" } },
    },
  ],
  rewards: {
    stepPenalty: -0.01,
    invalidAction: -0.5,
    unknownAction: -0.1,
  },
  episodeEnd: "All orders fulfilled and all pending payments captured",
};

export async function GET() {
  return NextResponse.json(actionSpace);
}
