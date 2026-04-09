"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  TextField,
  Divider,
  Box,
  Banner,
  Spinner,
  ResourceList,
  ResourceItem,
} from "@shopify/polaris";
import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "../../../lib/mock-data";

function paymentBadge(status: Order["paymentStatus"]) {
  switch (status) {
    case "paid":
      return <Badge tone="success">Paid</Badge>;
    case "pending":
      return <Badge tone="attention">Pending</Badge>;
    case "refunded":
      return <Badge tone="warning">Refunded</Badge>;
  }
}

function fulfillmentBadge(status: Order["fulfillmentStatus"]) {
  switch (status) {
    case "fulfilled":
      return <Badge tone="success">Fulfilled</Badge>;
    case "unfulfilled":
      return <Badge tone="attention">Unfulfilled</Badge>;
    case "partial":
      return <Badge tone="warning">Partial</Badge>;
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [banner, setBanner] = useState<{
    tone: "success" | "critical";
    message: string;
  } | null>(null);

  const fetchOrder = useCallback(() => {
    fetch(`/api/data/orders/${id}`)
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleAction = useCallback(
    async (action: string) => {
      setActionLoading(action);
      setBanner(null);
      const res = await fetch(`/api/data/orders/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setBanner({
          tone: "success",
          message:
            action === "fulfill"
              ? "Order fulfilled"
              : action === "capture"
                ? "Payment captured"
                : "Refund issued",
        });
      } else {
        setBanner({ tone: "critical", message: data.error });
      }
      setActionLoading("");
    },
    [id],
  );

  const handleAddNote = useCallback(async () => {
    if (!noteValue.trim()) return;
    setActionLoading("note");
    const res = await fetch(`/api/data/orders/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: noteValue }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
      setNoteValue("");
    }
    setActionLoading("");
  }, [id, noteValue]);

  if (loading || !order) {
    return (
      <Box padding="1000">
        <InlineStack align="center">
          <Spinner size="large" />
        </InlineStack>
      </Box>
    );
  }

  const addr = order.shippingAddress;

  return (
    <Page
      title={order.orderNumber}
      backAction={{
        content: "Orders",
        onAction: () => router.push("/admin/orders"),
      }}
      titleMetadata={
        <InlineStack gap="200">
          {paymentBadge(order.paymentStatus)}
          {fulfillmentBadge(order.fulfillmentStatus)}
        </InlineStack>
      }
      subtitle={`${order.date} from ${order.customer}`}
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
          {/* Fulfillment card */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingSm">
                  Fulfillment
                </Text>
                {fulfillmentBadge(order.fulfillmentStatus)}
              </InlineStack>
              <ResourceList
                resourceName={{ singular: "item", plural: "items" }}
                items={order.lineItems}
                renderItem={(item) => (
                  <ResourceItem
                    id={item.productId}
                    accessibilityLabel={item.title}
                    onClick={() => {}}
                  >
                    <InlineStack align="space-between">
                      <BlockStack>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {item.title}
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                          Qty: {item.quantity}
                        </Text>
                      </BlockStack>
                      <Text as="span" numeric>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </Text>
                    </InlineStack>
                  </ResourceItem>
                )}
              />
              {order.fulfillmentStatus !== "fulfilled" && (
                <InlineStack align="end">
                  <Button
                    variant="primary"
                    loading={actionLoading === "fulfill"}
                    onClick={() => handleAction("fulfill")}
                  >
                    Fulfill items
                  </Button>
                </InlineStack>
              )}
            </BlockStack>
          </Card>

          {/* Payment card */}
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingSm">
                  Payment
                </Text>
                {paymentBadge(order.paymentStatus)}
              </InlineStack>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Subtotal
                  </Text>
                  <Text as="span" numeric>
                    ${order.subtotal}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Shipping
                  </Text>
                  <Text as="span" numeric>
                    ${order.shipping}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Tax
                  </Text>
                  <Text as="span" numeric>
                    ${order.tax}
                  </Text>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="span" fontWeight="semibold">
                    Total
                  </Text>
                  <Text as="span" fontWeight="semibold" numeric>
                    ${order.total}
                  </Text>
                </InlineStack>
              </BlockStack>
              <InlineStack align="end" gap="200">
                {order.paymentStatus === "pending" && (
                  <Button
                    variant="primary"
                    loading={actionLoading === "capture"}
                    onClick={() => handleAction("capture")}
                  >
                    Capture payment
                  </Button>
                )}
                {order.paymentStatus === "paid" && (
                  <Button
                    tone="critical"
                    loading={actionLoading === "refund"}
                    onClick={() => handleAction("refund")}
                  >
                    Refund
                  </Button>
                )}
              </InlineStack>
            </BlockStack>
          </Card>

          {/* Timeline card */}
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">
                Timeline
              </Text>
              <BlockStack gap="300">
                {order.timeline.map((entry) => (
                  <Box key={entry.id}>
                    <InlineStack align="space-between">
                      <Text
                        as="span"
                        variant="bodySm"
                        fontWeight={entry.type === "comment" ? "semibold" : "regular"}
                      >
                        {entry.message}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                    </InlineStack>
                  </Box>
                ))}
              </BlockStack>
              <Divider />
              <InlineStack gap="200" blockAlign="end" wrap={false}>
                <Box width="100%">
                  <TextField
                    label="Add note"
                    labelHidden
                    placeholder="Leave a comment..."
                    value={noteValue}
                    onChange={setNoteValue}
                    autoComplete="off"
                  />
                </Box>
                <Button onClick={handleAddNote} loading={actionLoading === "note"}>
                  Post
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          {/* Customer card */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Customer
              </Text>
              <Text as="p" variant="bodyMd">
                {order.customer}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {order.email}
              </Text>
            </BlockStack>
          </Card>

          {/* Shipping address */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">
                Shipping address
              </Text>
              <Text as="p" variant="bodySm">
                {addr.firstName} {addr.lastName}
              </Text>
              <Text as="p" variant="bodySm">
                {addr.address1}
              </Text>
              {addr.address2 && (
                <Text as="p" variant="bodySm">
                  {addr.address2}
                </Text>
              )}
              <Text as="p" variant="bodySm">
                {addr.city}, {addr.province} {addr.zip}
              </Text>
              <Text as="p" variant="bodySm">
                {addr.country}
              </Text>
            </BlockStack>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Notes
                </Text>
                <Text as="p" variant="bodySm">
                  {order.notes}
                </Text>
              </BlockStack>
            </Card>
          )}

          {/* Tags */}
          {order.tags.length > 0 && (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Tags
                </Text>
                <InlineStack gap="100">
                  {order.tags.map((tag) => (
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
