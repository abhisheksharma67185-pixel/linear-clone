"use client";

import { Page, Card, EmptyState, Text, Link, Box, BlockStack } from "@shopify/polaris";

export default function CatalogsPage() {
  return (
    <Page
      title="Catalogs"
      primaryAction={{ content: "Create catalog" }}
      secondaryActions={[{ content: "Export" }, { content: "Import" }]}
    >
      <Card>
        <EmptyState
          heading="Personalize buying with catalogs"
          image=""
          action={{ content: "Create catalog" }}
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Create custom product and pricing offerings for your customers with catalogs.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            Learn more about <Link>catalogs</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
