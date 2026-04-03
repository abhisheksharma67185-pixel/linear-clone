"use client";

import { Page, Card, EmptyState, Text, Link, BlockStack, Box } from "@shopify/polaris";

export default function DraftsPage() {
  return (
    <Page title="Drafts">
      <Card>
        <EmptyState heading="Manually create orders and invoices" image="">
          <Text as="p" variant="bodyMd" tone="subdued">
            Use draft orders to take orders over the phone, email invoices to customers, and collect
            payments.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about creating draft orders</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
