"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  DataTable,
  Select,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import { dashboardStats } from "../../lib/mock-data";
import type { Product, Order } from "../../lib/mock-data";

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState("last_30_days");

  useEffect(() => {
    Promise.all([
      fetch("/api/data/products").then((r) => r.json()),
      fetch("/api/data/orders").then((r) => r.json()),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
    });
  }, []);

  const topProducts = [...products]
    .filter((p) => p.status === "active")
    .sort((a, b) => b.inventory - a.inventory)
    .slice(0, 5)
    .map((p) => [p.title, String(p.inventory), `$${p.price}`]);

  const recentOrders = orders.slice(0, 5).map((o) => [
    o.orderNumber,
    o.customer,
    `$${o.total}`,
    o.paymentStatus,
  ]);

  return (
    <Page title="Analytics">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Select
              label="Period"
              labelInline
              options={[
                { label: "Last 7 days", value: "last_7_days" },
                { label: "Last 30 days", value: "last_30_days" },
                { label: "Last 90 days", value: "last_90_days" },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">Total sales</Text>
              <Text as="p" variant="headingLg">{dashboardStats.totalSales}</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">Online store sessions</Text>
              <Text as="p" variant="headingLg">{dashboardStats.onlineStoreSessions.toLocaleString()}</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm" tone="subdued">Conversion rate</Text>
              <Text as="p" variant="headingLg">{dashboardStats.conversionRate}</Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Top products by inventory</Text>
              <DataTable
                columnContentTypes={["text", "numeric", "numeric"]}
                headings={["Product", "Inventory", "Price"]}
                rows={topProducts}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Recent orders</Text>
              <DataTable
                columnContentTypes={["text", "text", "numeric", "text"]}
                headings={["Order", "Customer", "Total", "Payment"]}
                rows={recentOrders}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
