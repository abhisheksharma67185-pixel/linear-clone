"use client";

import { Page, Card, EmptyState, Text, Link, BlockStack, Box } from "@shopify/polaris";

export default function AbandonedCheckoutsPage() {
  return (
    <Page title="Abandoned checkouts">
      <Card>
        <EmptyState heading="Abandoned checkouts will show here" image="">
          <Text as="p" variant="bodyMd" tone="subdued">
            See when customers put an item in their cart but don&apos;t check out. You can also
            email customers a link to their cart.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about abandoned checkouts</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
