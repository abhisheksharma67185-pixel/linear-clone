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

export default function MetaobjectsPage() {
  return (
    <Page
      title="Metaobjects"
      primaryAction={{ content: "Add definition" }}
      secondaryActions={[{ content: "Manage" }]}
    >
      <Card>
        <EmptyState
          heading="Streamline content creation with metaobjects"
          image=""
          action={{ content: "Add definition" }}
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Metaobjects allow you to group fields and connect them to different
            parts of your store. Use them to create custom content or data
            structures.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link>metaobjects</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
