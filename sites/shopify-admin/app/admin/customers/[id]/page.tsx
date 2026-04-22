"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Spinner,
  DataTable,
  TextField,
  FormLayout,
  Banner,
  Box,
} from "@shopify/polaris";
import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Customer, Order } from "../../../lib/mock-data";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{
    tone: "success" | "critical";
    message: string;
  } | null>(null);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/customers/${id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      }),
      fetch("/api/data/orders").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      }),
    ])
      .then(([cust, allOrders]) => {
        setCustomer(cust);
        setOrders(allOrders.filter((o: Order) => o.customerId === id));
        setFirstName(cust.firstName);
        setLastName(cust.lastName);
        setEmail(cust.email);
        setPhone(cust.phone);
        setNotes(cust.notes);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const res = await fetch(`/api/data/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phone, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomer(data);
      setEditing(false);
      setBanner({ tone: "success", message: "Customer updated" });
    } else {
      const data = await res.json();
      setBanner({ tone: "critical", message: data.error });
    }
    setSaving(false);
  }, [id, firstName, lastName, email, phone, notes]);

  if (loading || !customer) {
    return (
      <Box padding="1000">
        <InlineStack align="center">
          <Spinner size="large" />
        </InlineStack>
      </Box>
    );
  }

  const orderRows = orders.map((o) => [
    o.orderNumber,
    o.date,
    `$${o.total}`,
    o.paymentStatus,
    o.fulfillmentStatus,
  ]);

  const addr = customer.address;

  return (
    <Page
      title={customer.name}
      backAction={{
        content: "Customers",
        onAction: () => router.push("/admin/customers"),
      }}
      primaryAction={
        editing
          ? { content: "Save", loading: saving, onAction: handleSave }
          : { content: "Edit", onAction: () => setEditing(true) }
      }
    >
      {banner && (
        <Box paddingBlockEnd="400">
          <Banner tone={banner.tone} onDismiss={() => setBanner(null)}>
            {banner.message}
          </Banner>
        </Box>
      )}

      <Layout>
        <Layout.Section>
          {editing ? (
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingSm">
                  Contact information
                </Text>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="First name"
                      value={firstName}
                      onChange={setFirstName}
                      autoComplete="off"
                    />
                    <TextField
                      label="Last name"
                      value={lastName}
                      onChange={setLastName}
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <TextField
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    type="email"
                    autoComplete="off"
                  />
                  <TextField label="Phone" value={phone} onChange={setPhone} autoComplete="off" />
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={setNotes}
                    multiline={3}
                    autoComplete="off"
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Contact information
                </Text>
                <Text as="p" variant="bodyMd">
                  {customer.email}
                </Text>
                <Text as="p" variant="bodyMd">
                  {customer.phone}
                </Text>
              </BlockStack>
            </Card>
          )}

          {/* Order history */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Order history
              </Text>
              {orders.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text", "text"]}
                  headings={["Order", "Date", "Total", "Payment", "Fulfillment"]}
                  rows={orderRows}
                />
              ) : (
                <Text as="p" tone="subdued">
                  No orders yet
                </Text>
              )}
            </BlockStack>
          </Card>

          {/* Notes */}
          {!editing && customer.notes && (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Notes
                </Text>
                <Text as="p" variant="bodySm">
                  {customer.notes}
                </Text>
              </BlockStack>
            </Card>
          )}
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Overview
              </Text>
              <InlineStack align="space-between">
                <Text as="span" tone="subdued">
                  Orders
                </Text>
                <Text as="span" numeric>
                  {customer.orders}
                </Text>
              </InlineStack>
              <InlineStack align="space-between">
                <Text as="span" tone="subdued">
                  Total spent
                </Text>
                <Text as="span" numeric>
                  ${customer.totalSpent}
                </Text>
              </InlineStack>
              <InlineStack align="space-between">
                <Text as="span" tone="subdued">
                  Customer since
                </Text>
                <Text as="span">{customer.createdAt}</Text>
              </InlineStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Default address
              </Text>
              {addr.address1 ? (
                <>
                  <Text as="p" variant="bodySm">
                    {addr.firstName} {addr.lastName}
                  </Text>
                  <Text as="p" variant="bodySm">
                    {addr.address1}
                  </Text>
                  <Text as="p" variant="bodySm">
                    {addr.city}
                    {addr.province ? `, ${addr.province}` : ""} {addr.zip}
                  </Text>
                  <Text as="p" variant="bodySm">
                    {addr.country}
                  </Text>
                </>
              ) : (
                <Text as="p" variant="bodySm" tone="subdued">
                  No address on file
                </Text>
              )}
            </BlockStack>
          </Card>

          {customer.tags.length > 0 && (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Tags
                </Text>
                <InlineStack gap="100">
                  {customer.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
