"use client";

import {
  Page,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Button,
} from "@shopify/polaris";

export default function RolloutsPage() {
  return (
    <Page title="Rollouts">
      <Box padding="1600">
        <InlineStack align="center" blockAlign="center">
          <div style={{ maxWidth: 500 }}>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Upgrade your plan to access this feature
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                To use this feature, your store must be on any of the following
                plans: Basic, Grow, Advanced, Retail or Shopify Plus
              </Text>
              <div>
                <Button variant="primary">Upgrade plan</Button>
              </div>
            </BlockStack>
          </div>
        </InlineStack>
      </Box>
    </Page>
  );
}
