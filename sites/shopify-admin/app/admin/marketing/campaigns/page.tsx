"use client";

import { Page, Card, Text, BlockStack, InlineStack, Button } from "@shopify/polaris";

export default function CampaignsPage() {
  return (
    <Page title="Campaigns">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm" fontWeight="semibold">
              Centralize your campaign tracking
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Create campaigns to evaluate how marketing initiatives drive business goals. Capture
              online and offline touchpoints, add campaign activities from multiple marketing
              channels, and monitor results.
            </Text>
            <InlineStack gap="200">
              <Button variant="primary">Create campaign</Button>
              <Button>Learn more</Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm" fontWeight="semibold">
              Generate traffic with marketing apps
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Grow your audience on social platforms, capture new leads with newsletter sign-ups,
              increase conversion with chat, and more.
            </Text>
            <div>
              <Button>Browse marketing apps</Button>
            </div>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
