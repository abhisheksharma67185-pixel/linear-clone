"use client";

import { Page, Card, EmptyState, Text, Link, Box, BlockStack } from "@shopify/polaris";

export default function TransfersPage() {
  return (
    <Page
      title="Transfers"
      secondaryActions={[{ content: "Transfers report" }]}
    >
      <Card>
        <EmptyState
          heading="Move inventory between locations"
          image=""
          action={{ content: "Create transfer" }}
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Move and track inventory between your business locations.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about transfers</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
