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

export default function CatalogsPage() {
  return (
    <Page title="Catalogs">
      <Card>
        <EmptyState
          heading="Manage catalogs for your markets"
          image=""
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Create catalogs to customize product availability and pricing for
            different markets.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about catalogs</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
