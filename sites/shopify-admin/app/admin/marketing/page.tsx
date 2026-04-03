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

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Box padding="400" borderInlineEndWidth="025" borderColor="border">
      <BlockStack gap="200">
        <Text as="h3" variant="bodySm" tone="subdued">
          {title}
        </Text>
        <Text as="p" variant="headingMd">
          {value}
        </Text>
        <Box background="bg-surface-secondary" borderRadius="100" minHeight="4px" maxWidth="80px" />
      </BlockStack>
    </Box>
  );
}

export default function MarketingPage() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <Page title="Marketing">
      <BlockStack gap="400">
        {/* Date range selector */}
        <InlineStack gap="200">
          <Button size="slim">Last 30 days</Button>
          <Button size="slim" variant="plain">
            No comparison
          </Button>
        </InlineStack>

        {/* Stats row */}
        <Card padding="0">
          <InlineStack wrap={false}>
            <StatCard title="Sessions" value="0" />
            <StatCard title="Sales attributed to marketing" value="$0" />
            <StatCard title="Orders attributed to marketing" value="0" />
            <StatCard title="Conversion rate" value="0%" />
          </InlineStack>
        </Card>

        {/* Top marketing channels */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingSm">
                Top marketing channels
              </Text>
              <Link>View report</Link>
            </InlineStack>

            {showBanner && (
              <Banner tone="info" onDismiss={() => setShowBanner(false)}>
                Cost, click, and impression metrics are now available for supported marketing apps.{" "}
                <Link>Learn more</Link>
              </Banner>
            )}

            <Box
              background="bg-surface-secondary"
              borderRadius="200"
              minHeight="150px"
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

        {/* Centralize campaign tracking */}
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
            <div>
              <Button>Create campaign</Button>
            </div>
          </BlockStack>
        </Card>

        {/* Generate traffic */}
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
              <Button>Explore marketing apps</Button>
            </div>
          </BlockStack>
        </Card>

        {/* Footer */}
        <Box paddingBlock="200">
          <Text as="p" variant="bodySm" alignment="center" tone="subdued">
            Learn more about <Link>marketing campaigns</Link> and how{" "}
            <Link>Shopify syncs report data</Link>.
          </Text>
        </Box>
      </BlockStack>
    </Page>
  );
}
