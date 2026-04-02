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

export default function ReportsPage() {
  return (
    <Page title="Reports">
      <Card>
        <EmptyState
          heading="Custom reports"
          image=""
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Build custom reports to track and analyze your store data. Filter,
            sort, and group by different dimensions.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about reports</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
