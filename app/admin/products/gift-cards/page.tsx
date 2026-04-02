"use client";

import {
  Page,
  Card,
  EmptyState,
  Text,
  Link,
  Box,
  BlockStack,
  InlineStack,
  Button,
} from "@shopify/polaris";

export default function GiftCardsPage() {
  return (
    <Page
      title="Gift cards"
      secondaryActions={[{ content: "Export" }]}
    >
      <Card>
        <EmptyState
          heading="Start selling gift cards"
          image=""
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Add gift card products to sell or create gift cards and send them
            directly to your customers.
          </Text>
          <Box paddingBlockStart="300">
            <InlineStack gap="200" align="center">
              <Button>Create gift card</Button>
              <Button variant="primary">Add gift card product</Button>
            </InlineStack>
          </Box>
          <Box paddingBlockStart="400">
            <Text as="p" variant="bodySm" tone="subdued">
              By using gift cards, you agree to our{" "}
              <Link>Terms of Service</Link>
            </Text>
          </Box>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about gift cards</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
