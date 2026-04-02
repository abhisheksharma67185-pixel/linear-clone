"use client";

import {
  Page,
  Card,
  EmptyState,
  Text,
  Link,
  Box,
  BlockStack,
} from "@shopify/polaris";

export default function RolloutsPage() {
  return (
    <Page title="Rollouts">
      <Card>
        <EmptyState
          heading="Manage market rollouts"
          image=""
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Plan and schedule market launches to expand your business to new
            regions.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about rollouts</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
