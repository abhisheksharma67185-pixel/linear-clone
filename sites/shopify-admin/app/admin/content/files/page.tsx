"use client";

import { Page, Card, EmptyState, Text, Link, Box, BlockStack } from "@shopify/polaris";

export default function FilesPage() {
  return (
    <Page title="Files" primaryAction={{ content: "Upload files" }}>
      <Card>
        <EmptyState
          heading="Upload and manage your files"
          image=""
          action={{ content: "Upload files" }}
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Files can be images, videos, documents, and more.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about files</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
