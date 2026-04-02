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

export default function AutomationsPage() {
  return (
    <Page title="Automations">
      <Card>
        <EmptyState
          heading="Automate your marketing"
          image=""
          action={{ content: "Create automation" }}
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            Set up automated marketing to reach customers at the right moment.
            Send welcome emails, win back lost customers, and more.
          </Text>
        </EmptyState>
      </Card>
      <Box paddingBlock="400">
        <BlockStack align="center">
          <Text as="p" variant="bodySm" alignment="center">
            <Link monochrome>Learn more about marketing automations</Link>
          </Text>
        </BlockStack>
      </Box>
    </Page>
  );
}
