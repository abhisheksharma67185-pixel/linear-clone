"use client";

import { Page, Card, EmptyState, Text, Link, Box, BlockStack } from "@shopify/polaris";

export default function PurchaseOrdersPage() {
  return (
    <Page title="Purchase orders">
      <Card>
        <EmptyState
          heading="Manage your purchase orders"
          image=""
          action={{ content: "Create purchase order" }}
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Track and receive inventory ordered from suppliers.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about purchase orders</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
