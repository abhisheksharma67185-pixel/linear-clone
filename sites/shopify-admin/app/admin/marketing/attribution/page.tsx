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
  DataTable,
} from "@shopify/polaris";
import { useState } from "react";

export default function AttributionPage() {
  const [showBanner, setShowBanner] = useState(true);

  const attributionData = [
    ["Direct", "45", "12", "$3,842.00", "26.7%"],
    ["Email", "67", "18", "$5,124.50", "26.9%"],
    ["Organic search", "89", "7", "$1,985.30", "7.9%"],
    ["Social", "28", "5", "$1,895.52", "17.9%"],
  ];

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
              padding="400"
            >
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" tone="subdued">Sessions</Text>
                  <Text as="span" variant="bodySm" tone="subdued">Last 30 days</Text>
                </InlineStack>
                {/* Simple bar representation */}
                <Box paddingBlockStart="200">
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm">Organic search</Text>
                      <Box background="bg-fill-success" borderRadius="100" minHeight="12px" minWidth="178px" />
                      <Text as="span" variant="bodySm" fontWeight="semibold">89</Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm">Email</Text>
                      <Box background="bg-fill-info" borderRadius="100" minHeight="12px" minWidth="134px" />
                      <Text as="span" variant="bodySm" fontWeight="semibold">67</Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm">Direct</Text>
                      <Box background="bg-fill-warning" borderRadius="100" minHeight="12px" minWidth="90px" />
                      <Text as="span" variant="bodySm" fontWeight="semibold">45</Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm">Social</Text>
                      <Box background="bg-fill-critical" borderRadius="100" minHeight="12px" minWidth="56px" />
                      <Text as="span" variant="bodySm" fontWeight="semibold">28</Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
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

        {/* Attribution table */}
        <Card>
          <DataTable
            columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric"]}
            headings={["Channel", "Sessions", "Orders", "Revenue", "Conversion rate"]}
            rows={attributionData}
            totals={["", "229", "42", "$12,847.32", "18.3%"]}
            showTotalsInFooter
          />
        </Card>
      </BlockStack>
    </Page>
  );
}
