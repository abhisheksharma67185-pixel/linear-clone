"use client";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Box,
} from "@shopify/polaris";

function LiveStatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="bodySm" tone="subdued">{title}</Text>
        <Text as="p" variant="headingLg">{value}</Text>
      </BlockStack>
    </Card>
  );
}

export default function LiveViewPage() {
  return (
    <Page title="Live View" fullWidth>
      <BlockStack gap="400">
        <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
          <LiveStatCard title="Visitors right now" value="0" />
          <LiveStatCard title="Total sessions today" value="0" />
          <LiveStatCard title="Total orders today" value="0" />
          <LiveStatCard title="Total sales today" value="$0.00" />
        </InlineGrid>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm">Visitor map</Text>
            <Box
              background="bg-surface-secondary"
              borderRadius="200"
              minHeight="300px"
              padding="800"
            >
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                Real-time visitor map will appear when you have active sessions
              </Text>
            </Box>
          </BlockStack>
        </Card>

        <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Top pages right now</Text>
              <Box minHeight="100px" padding="400">
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  No active visitors
                </Text>
              </Box>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Top locations right now</Text>
              <Box minHeight="100px" padding="400">
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  No active visitors
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
