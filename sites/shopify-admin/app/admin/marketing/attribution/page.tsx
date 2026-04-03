"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Button,
  Banner,
  Link,
} from "@shopify/polaris";
import { useState } from "react";

export default function AttributionPage() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <Page title="Attribution" secondaryActions={[{ content: "Print" }, { content: "Export" }]}>
      <BlockStack gap="400">
        {/* Date filters */}
        <InlineStack gap="200">
          <Button size="slim">Last 30 days</Button>
          <Button size="slim">Daily</Button>
        </InlineStack>

        {/* Chart area */}
        <Card>
          <BlockStack gap="300">
            <Button variant="plain" disclosure>
              Sessions by top 5 channels over time
            </Button>
            <Box
              background="bg-surface-secondary"
              borderRadius="200"
              minHeight="200px"
              padding="800"
            >
              <BlockStack align="center">
                <Text as="p" variant="bodyMd" fontWeight="semibold" alignment="center">
                  No data found for the date range selected
                </Text>
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  Please select a different period
                </Text>
              </BlockStack>
            </Box>
          </BlockStack>
        </Card>

        {/* Info banner */}
        {showBanner && (
          <Banner tone="info" onDismiss={() => setShowBanner(false)}>
            Cost, click, and impression metrics are now available for supported marketing apps.{" "}
            <Link>Learn more</Link>
          </Banner>
        )}

        {/* Table area */}
        <Card>
          <Box background="bg-surface-secondary" borderRadius="200" minHeight="150px" padding="800">
            <BlockStack align="center">
              <Text as="p" variant="bodyMd" fontWeight="semibold" alignment="center">
                No data found for the date range selected
              </Text>
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                Please select a different period
              </Text>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}
